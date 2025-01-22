import { Schema, model, type Document } from 'mongoose';
import bcrypt from 'bcrypt';


export interface UserDocument extends Document {
    id: number;
    userName: string;
    userEmail: string;
    userPassword: string;
    isCorrectPassword(password: string): Promise<boolean>;
  }
  
  const userSchema = new Schema<UserDocument>(
    {
      userName: {
        type: String,
        required: true,
        unique: true,
      },
      userEmail: {
        type: String,
        required: true,
        unique: true,
        match: [/.+@.+\..+/, 'Must use a valid email address'],
      },
      userPassword: {
        type: String,
        required: true,
      },

    },
    // set this to use virtual below
    {
      toJSON: {
        virtuals: true,
      },
    }
  );
  
  // hash user password
  userSchema.pre('save', async function (next) {
    if (this.isNew || this.isModified('password')) {
      const saltRounds = 10;
      this.userPassword = await bcrypt.hash(this.userPassword, saltRounds);
    }
  
    next();
  });
  
  // custom method to compare and validate password for logging in
  userSchema.methods.isCorrectPassword = async function (userPassword: string) {
    return await bcrypt.compare(userPassword, this.userPassword);
  };
  
  
  const User = model<UserDocument>('User', userSchema);
  
  export default User;
  