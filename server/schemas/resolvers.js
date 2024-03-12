import { User, Book } from '../models'
import { signToken } from '../utils/auth'

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if (context.user) {
                return User.findOne({ _id: context.user._id });
            }
            throw new Error("Error! user not found");
        },
    },
    Mutation: {

        login: async (parent, args) => {
            const user = await User.FindOne({ email: args.email });

            if (!user) {
                throw new Error("Error! user not found");
            }
            const isCorrectPassword = await user.isCorrectPassword(args.password);

            if (!isCorrectPassword) {
                throw new Error("Error! invalid credentails");
            }
            const token = signToken(user);
            return { token, user };
        },

        addUser: async (parent, args) => {
            const user = await User.create(args);
            const token = signToken(user);
            return { token, user };
        },

        saveBook: async (parent, args, context) => {
            if (context.user) {
                const updatedUser = await User.findByIdAndUpdate(
                    {
                        _id: context.user._id,
                    },
                    {
                        $push: {
                            savedBooks: args.input,
                        },
                    },
                    { new: true}
                );
                return updatedUser;
            }
            throw new Error("Error! user not found");
        },

        removeBook: async (parent, args, context) => {
            if (context.user) {
                const updatedUser = await User.findByIdAndUpdate(
                    {
                        _id: context.user._id,
                    },
                    {
                        $pull: {
                            savedBooks: {
                                bookId: args.bookId
                            }
                        },
                    },
                    { new: true }
                );
                return updatedUser;
            }
            throw new Error("Error! user not found");
        },
    },
    
};

module.exports = resolvers;