'use strict';

const mongoose = require('mongoose');
// const sns = require('./aws/sns');
const Schema = mongoose.Schema;
// const NOTIFICATION_TOPIC = process.env.NOTIFICATION_TOPIC;
const MONGODB_CLUSTER_URI_DEV_NEW = process.env.MONGODB_CLUSTER_URI_DEV_NEW;

// TEST when using decrypted uri
// decrypt uri once
let decryptedUri = MONGODB_CLUSTER_URI_DEV_NEW;

// voicemail
const voicemailsSchema = new mongoose.Schema({
    _id: Schema.Types.ObjectId,
    caller: String,
    calledAt: String,
    createdAt: Date,
    purpose: String,
    transcript: String,
    download: String,
    expiryDate: String,
    contactId: String,
    queueId: String
});
const VoicemailsModel = mongoose.model('voicemails', voicemailsSchema);

/**
 * Send an SNS message to a topic that triggers the login lambda.
 *
 * @param {Object} event - Parameters to be pased to the lambda.
 * @return {Object} - Published SNS message details.
 */
exports.saveToDB = async event => {
    console.log('----------------saveToDB event', event);
    console.log('----------------mongoose decryptedUri', decryptedUri);
    console.log('----------env uri', process.env.MONGODB_CLUSTER_URI_DEV_NEW);
    try {
        await mongoose.connect(decryptedUri, { useNewUrlParser: true,
            useUnifiedTopology: true, useFindAndModify: false });
    } catch (error) {
        const errString = JSON.stringify(error);
        console.log('----------------mongoose error', errString);
        // await sns.publish({
        //     topicArn: NOTIFICATION_TOPIC,
        //     subject: 'mongoose connect failed',
        //     message: errString,
        //   });
        const success = true;
        return { success, errString };
    }

    mongoose.set('bufferCommands', false);
    let aVoicemails = new VoicemailsModel(event);
    const query = { download: event['download'] };
    const options = { upsert: true, new: true, setDefaultsOnInsert: true };
    // `doc` is the document _before_ `update` was applied
    let model = await VoicemailsModel.findOneAndUpdate(query, aVoicemails, options);
    console.log('-----model:', model);
    model = await VoicemailsModel.findOne(query);
    console.log('-----findOne model:', model);
    // await sns.publish({
    //     topicArn: NOTIFICATION_TOPIC,
    //     subject: 'mongoose findOneAndUpdate',
    //     message: model.download,
    //   });
    return { success: true };
};