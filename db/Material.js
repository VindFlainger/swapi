const db = require('./index')
const {maxLength} = require("./Validators/array");
const likes = require('../db/Schemas/likes')
const mongoose = require("mongoose");


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
        id: true,
        timestamps: {
            createdAt: true,
            updatedAt: false
        },
        toJSON: {
            versionKey: false
        },
        statics: {
            getReaderMaterials(readerId, limit = 20, offset = 0) {
                return Promise.all(
                    [
                        this.aggregate(
                            [
                                {
                                    $match: {
                                        readers: mongoose.Types.ObjectId(readerId)
                                    }
                                },
                                {
                                    $addFields: {
                                        "liked": {
                                            $in: [mongoose.Types.ObjectId(readerId), '$likes.voters.voter']
                                        },
                                        readers: {$size: '$readers'},
                                        likes: '$likes.count',
                                        id: '$_id'
                                    }
                                },
                                {
                                    $skip: offset
                                },
                                {
                                    $limit: limit,
                                },
                            ]),
                        this.count({
                            readers: readerId
                        })
                    ]
                )
                    .then(([data, count]) => {
                        return Promise.all(
                            [
                                this.populate(data, [
                                        {
                                            path: 'owner',
                                            select: {
                                                name: 1,
                                                surname: 1,
                                                avatar: 1,
                                            },
                                            populate: {
                                                path: 'avatar'
                                            }
                                        },
                                        {
                                            path: 'previewImage',
                                        },
                                        {
                                            path: 'documents',
                                        },
                                    ]
                                ),
                                count
                            ]
                        )
                    })
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
            addReader(materialId, readerId) {
                return this.findOneAndUpdate({
                        _id: materialId,
                        readers: readerId
                    },
                    {
                        $addToSet: {readers: readerId}
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
            },
            getSpecMaterials(specId, offset, limit) {
                return Promise.all([
                    this.find({owner: specId})
                        .sort({date: 1, _id: 1})
                        .skip(offset)
                        .limit(limit)
                        .populate(
                            {
                                path: 'readers',
                                select: {
                                    name: 1,
                                    surname: 1,
                                    avatar: 1
                                },
                                populate: {path: 'avatar'}
                            })
                        .populate('documents')
                        .populate('previewImage'),
                    this.count({owner: specId})
                ])
                    .then(([data, count]) =>
                        ({
                            materials: data,
                            limit: limit,
                            offset: offset,
                            totalCount: count
                        })
                    )
            }
        }
    }
)

module.exports = db.model('material', schema, 'materials')