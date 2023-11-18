import mongoose, { Document, Model } from 'mongoose';

interface IWarnCase extends Document {
    Guild: string;
    Case: number;
}

const WarnCaseSchema = new mongoose.Schema({
    Guild: String,
    Case: Number,
});

const WarnCaseModel: Model<IWarnCase> = mongoose.model<IWarnCase>("warnCase", WarnCaseSchema);

export default WarnCaseModel;