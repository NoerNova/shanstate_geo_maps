import type { NextApiRequest, NextApiResponse } from "next";

type Data = string;

export default async function delegate(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const delegate = require("../../data/delegate.json");
  res.status(200).json(delegate);
}
