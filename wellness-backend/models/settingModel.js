import { model, Schema } from "mongoose";

const settingsSchema = new Schema(
  {
    seoSetting: [
      {
        basicSetting: {
          siteTitle: {
            type: String,
            required: true,
            maxlength: 60,
          },
          metaDescription: {
            type: String,
            maxlength: 160,
          },
          keywords: {
            type: [String],
          },
          twitterHandle: {
            type: String,
          },
          googleAnalyticsId: {
            type: String,
          },
        },
        // Third-party scripts
        thirdPartySetting: {
          googleTagManagerId: { type: String },
          hotjarId: { type: String },
          intercomAppId: { type: String },
          zendeskWidgetKey: { type: String },
          customScripts: { type: String },
        },

        // Meta tags
        metaSetting: {
          author: { type: String },
          robots: { type: String, default: "index, follow" },
          viewport: {
            type: String,
            default: "width=device-width, initial-scale=1",
          },
          themeColor: { type: String },
          customMetaTags: { type: String },
        },
      },
    ],

    businessSetting: [
      {
        businessInformation: {
          businessName: {
            type: String,
            required: [true, "Business name is required"],
            trim: true,
            maxlength: [150, "Business name cannot exceed 150 characters"],
          },
          businessEmail: {
            type: String,
            required: [true, "Business email is required"],
            trim: true,
            lowercase: true,
            match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
          },
          businessPhone: {
            type: String,
            required: [true, "Business phone is required"],
            trim: true,
          },
          website: {
            type: String,
            trim: true,
            validate: {
              validator: function (v) {
                return !v || /^https?:\/\/.+/.test(v);
              },
              message: "Website must be a valid URL",
            },
          },
          businessAddress: {
            type: String,
            required: [true, "Business address is required"],
            trim: true,
            maxlength: [500, "Address cannot exceed 500 characters"],
          },
          gstNumber: {
            type: String,
            trim: true,
            uppercase: true,
            match: [
              /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
              "Invalid GST number format",
            ],
          },
          panNumber: {
            type: String,
            trim: true,
            uppercase: true,
            match: [/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN number format"],
          },
          businessType: {
            type: String,
            enum: [
              "Sole Proprietorship",
              "Partnership",
              "Private Limited",
              "Public Limited",
              "LLP",
              "Other",
            ],
            default: "Private Limited",
          },
          foundedYear: {
            type: Number,
            min: [1800, "Founded year must be after 1800"],
            max: [
              new Date().getFullYear(),
              "Founded year cannot be in the future",
            ],
          },
        },

        // Social Media Links
        socialMediaSetting: {
          socialMedia: {
            facebook: {
              type: String,
              trim: true,
            },
            instagram: {
              type: String,
              trim: true,
            },
            twitter: {
              type: String,
              trim: true,
            },
            linkedin: {
              type: String,
              trim: true,
            },
          },
        },
      },
    ],

    shippingSetting: [
      {
        defaultShippingRate: {
           type: Number, 
           required: true,
            default: 50
           },
        freeShippingThreshold: {
           type: Number,
            required: true, 
            default: 1000
           },
        shippingZones: [
          {
            zoneName: { type: String,
               required: true
               },
            shippingRate: { type: Number,
               required: true,
                default: 0
               },
            freeShippingThreshold: { type: Number,
               default: 0
               },
          },
        ],
        deliveryTimeframes: {
          standard: {
             type: String,
             default: "3-6 business days"
             },
          express: {
             type: String,
             default: "1-2 business days"
             },
          overnight: { 
            type: String,
             default: "Next day delivery"
             },
        },
      },
    ],
  },
  { timestamps: true }
);

const Setting = model("Setting", settingsSchema);

export default Setting;
