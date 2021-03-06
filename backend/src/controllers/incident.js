const dbConn = require('../database/connection');
require('dotenv').config();

const list = async (req, res) => {
    try {
        const pagination = process.env.PAGINATION;
        const { page = 1 } = req.query;

        const [count] = await dbConn('incidents').count();

        const incidents = await dbConn('incidents')
            .join('ongs', 'ongs.id', '=', 'incidents.ong_id')
            .limit(pagination)
            .offset((page - 1) * pagination)
            .select(['incidents.*',
                'ongs.name',
                'ongs.email',
                'ongs.whatsapp',
                'ongs.city',
                'ongs.uf']);
        res.header('X-Total-Count', count['count(*)']);
        return res.json(incidents);
    } catch (error) {
        console.log(error);
        return res.send(error.message);
    }
};

const create = async (req, res) => {
    try {
        const { title, description, value } = req.body;
        const ong_id = req.headers.authorization;
        const [id] = await dbConn('incidents').insert({
            title,
            description,
            value,
            ong_id,
        })

        return res.send({ id });
    } catch (error) {
        console.log(error);
        return res.send(error.message);
    }
};

const remove = async (req, res) => {
    try {
        const { id } = req.params;
        const ong_id = req.headers.authorization;

        const incident = await dbConn('incidents')
            .where('id', id)
            .select('ong_id')
            .first();

        if (incident.ong_id !== ong_id) {
            return res.status(401).json({ message: 'Operation not permitted' });
        }

        await dbConn('incidents').where('id', id).delete();

        return res.status(204).send();
    } catch (error) {
        return res.send(error.message);
    }
}

const listByOngId = async (req, res) => {
    try {
        const ong_id = req.headers.authorization;

        const incidents = await dbConn('incidents')
            .where('ong_id', ong_id).select('*');

        return res.json(incidents);
    } catch (error) {
        console.log(error);
        return res.send(error.message);
    }
}

module.exports = {
    create,
    list,
    remove,
    listByOngId
};