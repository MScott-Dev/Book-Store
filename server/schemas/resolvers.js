const { User } = require('../models');
const { signToken, AuthenticationError } = require('../utils/auth');

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (context.user) {
        return User.findOne({ _id: context.user._id }).select("-__v -password");
      }
      throw AuthenticationError;
    },
  },
  Mutation: {
    login: async (parent, args) => {
      const user = await User.FindOne({ email });

      if (!user) {
        throw AuthenticationError;
      }
      const isCorrectPassword = await user.isCorrectPassword(password);

      if (!isCorrectPassword) {
        throw AuthenticationError;
      }
      const token = signToken(user);
      return { token, user };
    },

    addUser: async (parent, args) => {
      const user = await User.create(args);
      const token = signToken(user);
      return { token, user };
    },
    saveBook: async (parent, { bookData }, context) => {
      if (context.user) {
        const updatedUser = await User.findByIdAndUpdate(
          {
            _id: context.user._id,
          },
          {
            $push: {
              savedBooks: bookData,
            },
          },
          { new: true }
        );
        return updatedUser;
      }
      throw AuthenticationError;
    },

    removeBook: async (parent, args, context) => {
      if (context.user) {
        const updatedUser = await User.findOneAndUpdate(
          {
            _id: context.user._id,
          },
          {
            $pull: {
              savedBooks: {
                bookId: args.bookId,
              },
            },
          },
          { new: true }
        );
        return updatedUser;
      }
      throw AuthenticationError;
    },
  },
};

module.exports = resolvers;