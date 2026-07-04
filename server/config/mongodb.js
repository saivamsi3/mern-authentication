import mongoose from "mongoose";

const getMongoUri = () => {
    const baseUri = process.env.MONGODB_URI;

    if (!baseUri) {
        throw new Error("MONGODB_URI is missing in .env");
    }

    const [uriWithoutQuery, queryString] = baseUri.split("?");
    const uriWithDb = uriWithoutQuery.endsWith("/")
        ? `${uriWithoutQuery}mern-auth`
        : `${uriWithoutQuery}/mern-auth`;

    return queryString ? `${uriWithDb}?${queryString}` : uriWithDb;
};

const connectDB = async () => {
    mongoose.connection.on("connected", () => console.log("db connected"));

    await mongoose.connect(getMongoUri());
};

export default connectDB;
