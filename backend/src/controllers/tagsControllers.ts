import tagsServices from "../services/tagsServices";

const returnTags = async (req: Request, res: Response) => {
	  try {
	const tags = await tagsServices.returnTags();
	res.status(200).json(tags);
  } catch (err) {
	res.status(500).json({ error: err });
  }
}

const tagsControllers = {
	  returnTags,
};

export default tagsControllers;