import { Request, Response } from "express";
import { handleResponse } from "../utils/decorators";
import userServices from "../services/userServices";
import { createUserDto, updateUserDto, updateUserLocationDto } from "../types/userTypes";

class UserControllers {
  constructor() {
    this.me = this.me.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
  }

  @handleResponse()
  public async me(req: Request, res: Response) {
    const token = req.headers.authorization?.split(" ")[1];
    return await userServices.me(token) as unknown as void;
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
    body.profile_picture = req.file?.path || "";
    const user = await userServices.update(body, req.params.id);
    if (req.file) {
      await userServices.addUserImage(req.params.id, req.file);
    }
    if (req.body.interests) {
      const interests = JSON.parse(req.body.interests);
      await userServices.addUserInterests(req.params.id, interests);
    }
    return user as unknown as void;
  }



  @handleResponse()
  public async getUsersById(req: Request, res: Response) {
    return await userServices.getUsersById(req.params.id) as unknown as void;
  }

  @handleResponse()
  public async delete(req: Request, res: Response) {
    return await userServices.delete(req.params.id) as unknown as void;
  }

  @handleResponse()
  public async updateUserLocation(req: Request, res: Response) {
    const body = updateUserLocationDto.validate(req.body);
    console.log(body);
    return await userServices.updateUserLocation(req.params.id, body) as unknown as void;
  }
}

export default new UserControllers();
