import mongoose from "mongoose";
import bcrypt from "bcrypt";

const AdminSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        phone: {
            type: String,
            required: true,
            unique: true,
        },
        firstName: {
            type: String,
            required: true,
        },
        lastName: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
        imageUrl: {
            type: String,
            default: "",
        },
        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active",
        },
        role: {
            type: String,
            enum: ["super_admin", "admin", "moderator"],
            default: "admin",
        },
        permissions: [
            {
                type: String,
            },
        ],
        twoFactorEnabled: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

AdminSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return next();
    }
    try {
        this.password = await bcrypt.hash(this.password, 10);
        next();
    } catch (error) {
        next(error);
    }
});

const Admin = mongoose.model("Admin", AdminSchema);

export default Admin;
