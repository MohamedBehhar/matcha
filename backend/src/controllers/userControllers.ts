import { Request, Response } from "express";
import { handleResponse } from "../utils/decorators";
import userServices from "../services/userServices";
import {
  createUserDto,
  updateUserDto,
  updateUserLocationDto,
} from "../types/userTypes";
import { ForbiddenError, UnauthorizedError } from "../lib/customError";

class UserControllers {
  constructor() {
    this.me = this.me.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
  }

  @handleResponse()
  public async me(req: Request, res: Response) {
    // Get the access token from cookies
    const accessToken = req.cookies.access_token;
    console.log(
      "----------- Access token: --------\n",
      accessToken,
      "-- - - - - - - - - -\n"
    );

    if (!accessToken) {
      throw new UnauthorizedError("Access token not found");
    }
    return await userServices.me(accessToken);
  }

  @handleResponse()
  public async create(req: Request, res: Response) {
    const body = createUserDto.validate(req.body);
    const user = await userServices.create(body);

    // Handle image if uploaded
    if (req.file) {
      await userServices.addUserImage(user.id, req.file);
    }

    return user as unknown as void;
  }

  @handleResponse()
  public async update(req: Request, res: Response) {
    const body = updateUserDto.validate(req.body);
    if (req.file?.filename) {
      body.profile_picture = "/" + req.file?.filename || "";
    }
    const user = await userServices.update(body, req.params.id);
    if (req.body.interests) {
      const interests = JSON.parse(req.body.interests);
      await userServices.addUserInterests(req.params.id, interests);
    }
    console.log(await userServices.profileCompleted(req.params.id));
    return user as unknown as void;
  }

  @handleResponse()
  public async getUsersById(req: Request, res: Response) {
    return (await userServices.getUsersById(req.params.id)) as unknown as void;
  }

  @handleResponse()
  public async delete(req: Request, res: Response) {
    return (await userServices.delete(req.params.id)) as unknown as void;
  }

  @handleResponse()
  public async updateUserLocation(req: Request, res: Response) {
    const body = updateUserLocationDto.validate(req.body);
    console.log(body);
    return (await userServices.updateUserLocation(
      req.params.id,
      body
    )) as unknown as void;
  }

  @handleResponse()
  public async addImages(req: Request, res: Response) {
    console.log("- - - - - - - - - - - - - hhh - - - - - - - ");
    const images = req.files as [];
    const userId = req.params.id;
    console.log("hhhh ", images);
    for (const image of images) {
      await userServices.addUserImage(userId, image);
    }
    return (await userServices.getUserImages(userId)) as unknown as void;
  }

  @handleResponse()
  public async getUserImages(req: Request, res: Response) {
    return (await userServices.getUserImages(req.params.id)) as unknown as void;
  }

  @handleResponse()
  public async deleteImage(req: Request, res: Response) {
    return (await userServices.deleteImage(req.params.id)) as unknown as void;
  }
}

export default new UserControllers();
