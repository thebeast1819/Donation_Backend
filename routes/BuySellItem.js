// package and other modules
const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");

// Local imports
const { UserAuth } = require("../middlewares/AuthValidator");
const { buySellItems } = require("../models/BuySellItem");
const { DeleteMultipleFiles, DeleteAFolder } = require("../utils/Cloudinary");
const messages = require("../config/messages");
const { UploadFilesForPayload } = require("../controllers/BuySell");
const { ValidateBuySell } = require("../middlewares/BuySellValidator");
const { users } = require("../models/Users");

// Initialize router
const router = express.Router();

// Multer configuration
const upload = multer({ storage: multer.memoryStorage() });

// Get buy-sell feed in batches of 10, according to the time they were posted
router.get("/get-buy-sell-feed", UserAuth, async (req, res) => {
  try {
    // Get the products in batches of 10 after this _id
    let after = req.query?.after ? mongoose.Types.ObjectId(req.query.after) : null;

    // get data in count of
    let count = req.query?.count || 10;

    // Create a filter if last_post_id is present
    let after_this_id_filter = after ? { _id: { $lt: after } } : {};

    const buy_sell_list = await buySellItems.aggregate([
      {
        // Match the products with the filter
        $match: {
          ...after_this_id_filter,
        },
      },
      // sort them in descending order of _id
      {
        $sort: {
          _id: -1,
        },
      },
      // limit to count
      {
        $limit: count,
      },
      // Replace posted_by field with the user's name
      {
        $lookup: {
          from: "users",
          localField: "posted_by",
          foreignField: "_id",
          as: "posted_by_details",
        },
      },
      {
        $unwind: "$posted_by_details",
      },
      {
        $addFields: {
          owner_details: {
            _id: "$posted_by_details._id",
            name: "$posted_by_details.name",
            profile_picture: "$posted_by_details.profile_picture",
            hostel: "$posted_by_details.hostel",
            room_number: "$posted_by_details.room_number",
          },
        },
      },
      // remove unnecessary fields
      {
        $project: {
          __v: 0,
          posted_by_details: 0,
        },
      },
    ]);

    // return the list
    return res.send({ products: buy_sell_list, message: "Feed for BUY_SELL" });
  } catch (error) {
    return res.status(500).send({ message: messages.serverError });
  }
});

// Get Product details
router.get("/get-buysell-product-details", UserAuth, async (req, res) => {
  try {
    // check if product_id is present in query
    if (!req.query.product_id)
      return res.status(400).send({ message: messages.product_id_required });

    // constants
    const product_id = req.query.product_id;

    // Check if product exists
    const product = await buySellItems.findById(product_id, {
      __v: 0,
    });
    if (!product) return res.status(404).send({ message: messages.product_not_found });

    let product_details = product.toObject();

    // get the owner of the product
    const owner = await users.findById(product.posted_by, {
      name: 1,
      profile_picture: 1,
      hostel: 1,
      room_number: 1,
      phone: 1,
    });
    if (owner) product_details.owner_details = owner.toObject();

    // Send the product details
    return res.send({
      Product: product_details,
      message: "These are the latest product details",
    });
  } catch (error) {
    return res.status(500).send({ message: messages.serverError });
  }
});

// Create new Product Endpoint
router.post(
  "/create-new-buysell-product",
  upload.array("files", 5),
  UserAuth,
  ValidateBuySell,
  async (req, res) => {
    try {
      // Create new product instance
      const newProduct = new buySellItems(req.body);
      newProduct.posted_by = req.body.user_details._id;

      // destination for the files
      const destination = `Kolegia/users/${newProduct.posted_by}/buy-sell/${newProduct._id}`;

      // If there are files, upload them to Cloudinary
      if (req.body.files.length > 0) {
        // Upload multiple files to Cloudinary
        const uploaded_files = await UploadFilesForPayload(req.body.files, destination);

        // Assign the files array to the newProduct.files
        newProduct.files = uploaded_files;
      }

      // Saving the new product to the database
      await newProduct.save();

      let product_details = newProduct.toObject();

      product_details.posted_by = req.body.user_details.name;

      // Return the new product
      return res.send({
        Product: product_details,
        message: "New Buy-Sell Product Created",
      });
    } catch (error) {
      return res.status(500).send({ message: messages.serverError });
    }
  }
);

// Edit Product Endpoint
router.put(
  "/edit-buy-sell-product",
  upload.array("files", 5),
  UserAuth,
  ValidateBuySell,
  async (req, res) => {
    try {
      // check if product_id is present in body
      if (!req.body.product_id)
        return res.status(400).send({ message: messages.product_id_required });

      // Check if product exists
      const product = await buySellItems.findById(req.body.product_id);
      if (!product) return res.status(404).send({ message: messages.product_not_found });

      // Check if user is the product's owner
      if (product.posted_by.toString() !== req.body.user_details._id.toString())
        return res.status(401).send({ message: messages.unauthorized });

      // Update product
      // map through the body and assign the new values to the product
      Object.keys(req.body).map(key => {
        if (key !== "files") product[key] = req.body[key];
      });

      // Check if after uploading and deleting there are any file left or not
      let currentFiles = product.files.length;
      let toUpload = req.body.files?.length ?? 0;
      let toDelete = req.body.to_be_deleted?.length ?? 0;

      // Destination for the files
      const destination = `Kolegia/users/${product.posted_by}/buy-sell/${product._id}`;

      if (currentFiles + toUpload - toDelete < 1)
        return res.status(400).send({
          message: "Your product should have atleast one image in it.",
        });

      // If files array is not empty, upload them to Cloudinary and push it to the product.files array
      if (toUpload > 0) {
        // Upload multiple files to Cloudinary
        const uploaded_files = await UploadFilesForPayload(req.body.files, destination);

        // Assign the files array to the newProduct.files
        product.files = [...product.files, ...uploaded_files];
      }

      // If there are files that need to be deleted, delete them from Cloudinary
      if (toDelete > 0) {
        // Delete the files from Cloudinary
        await DeleteMultipleFiles(req.body.to_be_deleted);

        // Remove the files from the product.files array whose _id is in the req.body.to_be_deleted array
        product.files = product.files.filter(
          file => !req.body.to_be_deleted.includes(file.public_id)
        );
      }

      await product.save();

      return res.send({ product: product, message: "Product Updated" });
    } catch (error) {
      return res.status(500).send({ message: messages.serverError });
    }
  }
);

// Delete Product Endpoint
router.delete("/delete-buy-sell-product", UserAuth, async (req, res) => {
  try {
    // Check if product_id is present in body
    if (!req.body.product_id)
      return res.status(400).send({ message: messages.product_id_required });

    // check if Product exists
    const product = await buySellItems.findById(req.body.product_id);
    if (!product) return res.status(404).send({ message: messages.product_not_found });

    // check if user is the product's owner
    if (product.posted_by.toString() !== req.body.user_details._id.toString())
      return res.status(401).send({ message: messages.unauthorized });

    // Delete folder from cloudinary
    await DeleteAFolder(`Kolegia/users/${product.posted_by}/buy-sell/${product._id}`);

    // Delete product
    await product.delete();

    // return response
    return res.send({ message: messages.product_deleted });
  } catch (error) {
    return res.status(500).send({ message: messages.serverError });
  }
});

// Get my lost item posts
router.get("/get-own-buy-sell-list", UserAuth, async (req, res) => {
  try {
    // Get user's id
    const user_id = req.body.user_details._id;

    // Get all products which has posted_by equal to user_id
    const user_products = await buySellItems
      .find({
        posted_by: user_id,
      })
      .sort({ _id: -1 });

    // Return the products list
    return res.send({
      Products: user_products,
      message: "List of items posted by user for selling.",
    });
  } catch (error) {
    return res.status(500).send({ message: messages.serverError });
  }
});

// Search for Buy-Sell items
router.get("/search-buy-sell-products", UserAuth, async (req, res) => {
  try {
    if (!req.query?.search) return res.status(400).send({ message: "Search Query is Required" });

    // Search for items with the given search query
    const buy_sell_list = await buySellItems.aggregate([
      {
        // Match the products with the filter
        $match: {
          $text: {
            $search: req.query.search,
          },
        },
      },
      // sort them in descending order of _id
      {
        $sort: {
          _id: -1,
        },
      },
      // Replace posted_by field with the user's name
      {
        $lookup: {
          from: "users",
          localField: "posted_by",
          foreignField: "_id",
          as: "posted_by_details",
        },
      },
      {
        $unwind: "$posted_by_details",
      },
      {
        $addFields: {
          owner_details: {
            _id: "$posted_by_details._id",
            name: "$posted_by_details.name",
            profile_picture: "$posted_by_details.profile_picture",
            hostel: "$posted_by_details.hostel",
            room_number: "$posted_by_details.room_number",
          },
        },
      },
      // remove unnecessary fields
      {
        $project: {
          __v: 0,
          posted_by_details: 0,
        },
      },
    ]);

    return res.send({
      products: buy_sell_list,
      message: "Search Results for Buy-Sell items",
    });
  } catch (error) {
    return res.status(500).send({ message: messages.serverError });
  }
});

// export router
module.exports = router;
