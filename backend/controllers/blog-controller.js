import mongoose from "mongoose";
import Blog from "../model/Blog";
import User from "../model/User";

export const getAllBlogs = async (req, res, next) => {
  let blogs;

  try {
    blogs = await Blog.find();
  } catch (error) {
    console.log(error);
  }

  if (!blogs) {
    return res.status(404).json({ message: "No blogs found" });
  }

  return res.status(200).json({ blogs });
};

export const createBlog = async (req, res, next) => {
  const { title, description, image, user } = req.body;

  let existingUser;

  try {
    existingUser = await User.findById(user);
  } catch (error) {
    return console.log(error);
  }

  if (!existingUser) {
    return res.status(404).json({ message: "No user found" });
  }

  const blog = new Blog({
    title,
    description,
    image,
    user,
  });

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await blog.save({ session: sess });
    existingUser.blogs.push(blog);
    await existingUser.save({ session: sess });
    await sess.commitTransaction();
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }

  return res.status(200).json({ blog });
};

export const updateBlog = async (req, res, next) => {
  const blogId = req.params.id;
  const { title, description } = req.body;
  let blog;

  try {
    blog = await Blog.findByIdAndUpdate(blogId, { title, description });
  } catch (error) {
    return console.log(error);
  }

  if (!blog) {
    return res.status(404).json({ message: "No blog found" });
  }

  return res.status(200).json({ blog });
};

export const getBlogById = async (req, res, next) => {
  const blogId = req.params.id;
  let blog;

  try {
    blog = await Blog.findById(blogId);
  } catch (error) {
    return console.log(error);
  }
  if (!blog) {
    return res.status(404).json({ message: "No blog found" });
  }

  return res.status(200).json({ blog });
};

export const deleteBlog = async (req, res, next) => {
  const blogId = req.params.id;
  let blog;

  try {
    blog = await Blog.findByIdAndDelete(blogId).populate("user");
    await blog.user.blogs.pull(blog);
    await blog.user.save();
  } catch (error) {
    return console.log(error);
  }

  if (!blog) {
    return res.status(404).json({ message: "No blog found" });
  }

  return res.status(200).json({ message: "Blog deleted" });
};

export const getUserBlog = async (req, res, next) => {
  const userId = req.params.id;
  let userWithBlogs;

  try {
    userWithBlogs = await User.findById(userId).populate("blogs");
  } catch (error) {
    return console.log(error);
  }

  if (!userWithBlogs) {
    return res.status(404).json({ message: "No blg found" });
  }

  return res.status(200).json({ blog: userWithBlogs });
};
