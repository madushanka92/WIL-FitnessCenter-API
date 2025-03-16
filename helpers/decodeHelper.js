
import JWT from "jsonwebtoken";

export const tokenDecoder = (req) => {

    const authHeader = req.headers.authorization;

    // Extract token (remove 'Bearer ' prefix)
    const token = authHeader.split(" ")[1];
    const decode = JWT.verify(token, process.env.JWT_SECRET);

    const user_id = decode._id;
    const membership_id = decode.membership_id;
    const role = decode.role;

    return { user_id, membership_id, role };
}