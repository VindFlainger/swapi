const db = require('./index')
const {maxLength} = require("./Validators/array");
const likes = require('../db/Schemas/likes')


const schema = new db.Schema(
    {
        owner: {
            type: db.Schema.Types.ObjectId,
            ref: 'user',
            required: true
        },
        readers: [{
            type: db.Schema.Types.ObjectId,
            ref: 'user',
            validate: maxLength(1000)
        }],
        name: {
            type: String,
            maxLength: 50,
            required: true,
        },
        description: {
            type: String,
            maxLength: 300,
            required: false,
        },
        previewImage: {
            type: db.Schema.Types.ObjectId,
            required: false,
            ref: 'img'
        },
        documents: {
            type: [db.Schema.Types.ObjectId],
            ref: 'file',
            validate: maxLength(30)
        },
        likes: likes
    },
    {
        timestamps: {
            createdAt: true,
            updatedAt: false
        },
        toJSON: {
            versionKey: false
        },
        statics: {
            getReaderMaterials(readerId) {
                return this.find({
                    readers: readerId
                })
                    .select({
                        readers: 0
                    })
                    .populate({
                        path: 'owner',
                        select: {
                            name: 1,
                            surname: 1,
                            avatar: 1,
                        },
                        populate: {
                            path: 'avatar'
                        }
                    })
                    .populate('documents')
                    .populate('previewImage')
            },
            deleteReader(materialId, readerId) {
                return this.findOneAndUpdate({
                        _id: materialId,
                        readers: readerId
                    },
                    {
                        $pull: {readers: readerId}
                    }
                )
            },
            isExists(materialId) {
                return this.exists({_id: materialId})
            },
            setLike(materialId, userId) {
                return this.findOneAndUpdate({
                        _id: materialId,
                        'likes.voters.voter': {$ne: userId}
                    },
                    {
                        $inc: {'likes.count': 1},
                        $push: {
                            'likes.voters': {
                                voter: userId
                            }
                        }
                    })
            },
            delLike(materialId, userId) {
                return this.findOneAndUpdate({
                        _id: materialId,
                        'likes.voters.voter': userId
                    },
                    {
                        $inc: {'likes.count': -1},
                        $pull: {
                            'likes.voters': {
                                voter: userId
                            }
                        }
                    })
            }
        }
    }
)

module.exports = db.model('material', schema, 'materials')