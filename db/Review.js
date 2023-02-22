const db = require('./index')

const schema = new db.Schema({
        owner: {
            type: db.Schema.Types.ObjectId,
            required: true,
        },
        reviewer: {
            type: db.Schema.Types.ObjectId,
            ref: 'user',
            required: true
        },
        title: {
            type: String,
            required: false
        },
        text: {
            type: String,
            required: false
        },
        advantages: {
            type: String,
            required: false
        },
        disadvantages: {
            type: String,
            required: false
        },
        stars: {
            type: Number,
            max: 5,
            required: true
        },
    },
    {
        toJSON: {virtuals: true},
        toObject: {virtuals: true},
        timestamps: true,
        statics: {
            getOwnerAvg(ownerId) {
                return this.aggregate([
                    {
                        $group: {
                            _id: {
                                'owner': ownerId
                            },
                            avg: {$avg: '$stars'}
                        }
                    },
                ])
                    .then(data => {
                        return data?.[0]?.avg
                    })
            },
            getOwnerReviews(ownerId, offset = 0, limit = 10) {
                return this
                    .find({owner: ownerId})
                    .skip(offset)
                    .limit(limit)
                    .populate(
                        {
                            path: 'reviewer',
                            select: {name: 1, avatar: 1, surname: 1},
                            populate: {path: 'avatar'}
                        })
            },
            countOwnerReviews(ownerId) {
                return this.count({owner: ownerId})
            },
            getOwnerReviewsInfo(ownerId, offset = 0, limit = 10) {
                return Promise.all([this.getOwnerReviews(ownerId, offset, limit), this.countOwnerReviews(ownerId), this.getOwnerAvg(ownerId)])
                    .then(([reviews, totalCount, avg]) => {
                        return {
                            reviews,
                            avg,
                            limit,
                            offset,
                            totalCount
                        }
                    })
            },
            addReview(ownerId, reviewerId, {title, text, advantages, disadvantages, stars = 5}) {
                return this.updateOne(
                    {
                        owner: ownerId,
                        reviewer: reviewerId,
                    },
                    {
                        title,
                        text,
                        disadvantages,
                        stars,
                        advantages
                    },
                    {
                        upsert: true
                    })
            }
        }
    })

module.exports = db.model('review', schema)