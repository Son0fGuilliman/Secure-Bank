import Joi from 'joi';

export const transferSchema = Joi.object({
    nomor_rekening_tujuan: Joi.string().required()
        .messages({ 'any.required': 'Nomor rekening tujuan wajib diisi' }),
    nominal: Joi.number().integer().positive().min(10000).max(50000000).required()
        .messages({
            'number.min': 'Nominal minimal Rp 10.000',
            'number.max': 'Nominal maksimal Rp 50.000.000',
        }),
    keterangan: Joi.string().max(200).optional().allow(''),
});