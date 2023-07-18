import SequenceId from '@common/sequence-id/SequenceId';

export enum SequenceIdType {
    USER_ID = 'user_id',
}

export class SequenceIdService {
    /**
     * Generate user_id from largest item in database
     *
     * @static
     * @returns {Promise<number>}
     * @memberof IdService
     */
    static async generateId(type: SequenceIdType): Promise<number> {
        // TODO: using redis for auto increment id, but it's not nessesary now
        const sequenceId = await SequenceId.findOneAndUpdate(
            { _id: type },
            { $inc: { current: 1 } },
            { new: true, upsert: true },
        );
        return sequenceId.current;
    }
}
