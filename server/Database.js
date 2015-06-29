/**
 * Created by Ning on 6/29/2015.
 */

var connection;
var mysql = require('mysql');

exports.connect = function () {
    connection = mysql.createConnection({
        host     : 'localhost',
        user     : 'root',
        password : '123456',
        database : 'bomberman'
    });

    connection.connect();
};

exports.query = function (query, handler) {
    connection.query(query, handler);
}