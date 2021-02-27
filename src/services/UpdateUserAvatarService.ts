import path from "path";
import { getRepository } from "typeorm";
import fs from "fs";
import User from "../models/User";
import uploadConfig from "../config/upload";
import AppError from "../errors/AppError";

interface Request {
    user_id: string;
    avatarFilename: string;
}
class UpdateUserAvatarService {
    public async execute({
        user_id,
        avatarFilename,
    }: Request): Promise<User | undefined> {
        const usersRepository = getRepository(User);
        const user = await usersRepository.findOne(user_id);
        if (!user) {
            throw new AppError(
                "Only authenticated users can change avatar.",
                401
            );
        }

        if (user.avatar) {
            //delete previous avatar
            const userAvatarFilePath = path.join(
                uploadConfig.directory,
                user.avatar
            );

            //verify if file exists
            const userAvatarFileExists = await fs.promises.stat(
                userAvatarFilePath
            );
            //if file exists delete
            if (userAvatarFileExists) {
                await fs.promises.unlink(userAvatarFilePath);
            }
            //update avatar
            user.avatar = avatarFilename;
            await usersRepository.save(user);

            return user;
        }
    }
}

export default UpdateUserAvatarService;