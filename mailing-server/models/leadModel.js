import mongoose from "mongoose";

const { Schema } = mongoose;

const LeadSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        campaign: {
            type: Schema.Types.ObjectId,
            ref: "Campaign",
            required: true,
        },

        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },

        provider: {
            type: String,
            required: true,
            enum: [
                "gmail",
                "yahoo",
                "outlook",
                "icloud",
                "aol",
                "protonmail",
                "zoho",
                "yandex",
                "other",
            ],
            default: "other",
        },

        email_secure_gateway: {
            type: String,
            required: true,
        },

        status: {
            type: String,
            required: true, // e.g., "sending_mails", "replied", "bounced"
        },
    },
    { timestamps: true }
);

// Auto-detect provider based on email domain
LeadSchema.pre("save", function (next) {
    if (this.isModified("email")) {
        const email = this.email;
        const domain = email.split("@")[1]?.toLowerCase() || "";

        const providerMap = {
            "gmail.com": "gmail",
            "googlemail.com": "gmail",
            "yahoo.com": "yahoo",
            "ymail.com": "yahoo",
            "outlook.com": "outlook",
            "hotmail.com": "outlook",
            "live.com": "outlook",
            "icloud.com": "icloud",
            "me.com": "icloud",
            "aol.com": "aol",
            "protonmail.com": "protonmail",
            "proton.me": "protonmail",
            "zoho.com": "zoho",
            "yandex.com": "yandex",
            "yandex.ru": "yandex",
        };

        this.provider = providerMap[domain] || "other";
    }

    next();
});

const Lead = mongoose.models.Lead || mongoose.model("Lead", LeadSchema);
export default Lead;
