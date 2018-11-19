'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const { _words } = require('../../components/lodash');

const config = require('../../config');

const basename = path.basename(__filename);
const Op = Sequelize.Op;
const operatorsAliases = {
    $and: Op.and,
    $gt: Op.gt,
    $in: Op.in,
    $notIn: Op.notIn,
    $or: Op.or
};
const db = {};

const sequelize = new Sequelize(config.get('db:database'), config.get('db:username'), config.get('db:password'), {
    logging: config.get('db:logging') ? console.log : false,
    host: config.get('db:host'),
    freezeTableName: true,
    dialect: 'postgres',
    operatorsAliases
});

fs.readdirSync(__dirname)
    .filter(file => file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js')
    .forEach(file => {
        const model = sequelize['import'](path.join(__dirname, file));
        db[model.name] = model;
    });

Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }

    if (db[modelName].addScopes) {
        db[modelName].addScopes(db);
    }

    db[modelName]['generateNestedQuery'] = query => {
        return sequelize.literal(
            `(${sequelize
                .getQueryInterface()
                .QueryGenerator.selectQuery(db[modelName].getTableName(), query)
                .slice(0, -1)})`
        );
    };
});

db.generateSearchQuery = (string, field = ['firstName', 'lastName']) => {
    const permArr = [];
    const newArray = [];
    const usedChars = [];

    let strings = _words(string);

    if (strings.length > 5) {
        strings = [
            strings[0],
            strings[1],
            strings[2],
            strings[3],
            strings[4],
            strings.slice(5, strings.length).join(' ')
        ];
    }

    for (let i = 0; i < field.length; i++) {
        newArray.push(sequelize.col(field[i]));
        if (field.length !== i + 1) {
            newArray.push(' ');
        }
    }

    const columns = sequelize.fn('concat', ...newArray);

    function p(input) {
        let i, ch;

        for (i = 0; i < input.length; i++) {
            ch = input.splice(i, 1)[0];
            usedChars.push(ch);
            if (input.length === 0) {
                permArr.push(
                    sequelize.where(columns, {
                        [Op.iLike]: `%${usedChars.slice().join('%')}%`
                    })
                );
            }
            p(input);
            input.splice(i, 0, ch);
            usedChars.pop();
        }

        return permArr;
    }

    return { [Op.or]: p(strings) };
};

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
