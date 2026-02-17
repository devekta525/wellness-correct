import mongoose from "mongoose";

const reportLogSchema = new mongoose.Schema(
  {
    influencerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    reportName: { type: String, required: true },
    reportType: { type: String, required: true },
    format: { type: String, required: true },
    fileSize: { type: String, default: "0 MB" },
    url: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("ReportLog", reportLogSchema);