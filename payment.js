module.exports = function(){
    var express = require('express');
    var router = express.Router();


    function getPayment(res, mysql, context, complete){
        mysql.pool.query("SELECT transaction_id as id, payment_date, amount, type_payment, invoice_number FROM payments ORDER BY invoice_number", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.payment = results;
            complete();
        });
    }

    function getUpdate(res, mysql, context, id, complete){
          var sql = "SELECT transaction_id as id, payment_date, amount, type_payment, invoice_number FROM payments WHERE transaction_id = ?";
          var inserts = [id];
          mysql.pool.query(sql, inserts, function(error, results, fields){
              if(error){
                  res.write(JSON.stringify(error));
                  res.end();
              }
              context.item = results[0];
              complete();
          });
      }

        //find payment with associate transaction id
        function getPaymentById(req, res, mysql, context, complete) {
           var query = "SELECT transaction_id as id, payment_date, amount, type_payment, invoice_number FROM payments WHERE transaction_id LIKE " + mysql.pool.escape(req.params.s + '%');
          //console.log(query)
          mysql.pool.query(query, function(error, results, fields){
                if(error){
                    res.write(JSON.stringify(error));
                    res.end();
                }
                context.payment = results;
                complete();
            });
        }

    //Display all payment
    router.get('/', function(req, res){
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["search_item.js","delete_item.js"];
        var mysql = req.app.get('mysql');
        getPayment(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 1){
                res.render('payment', context);
            }

        }
    });

    //display all payment with inut transaction id
    router.get('/search/:s', function(req, res){
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["search_item.js"];
        context.css = ["styles.css"]
        var mysql = req.app.get('mysql');
        getPaymentById(req, res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 1){
                res.render('payment', context);
            }
        }
    });


    //add a payment
    router.post('/', function(req, res){
        //console.log(req.body)
        var mysql = req.app.get('mysql');
        var sql = "INSERT INTO payments (payment_date, amount, type_payment, invoice_number) VALUES (?,?,?,?)";
        var inserts = [req.body.payment_date, req.body.amount, req.body.type_payment, req.body.invoice_number];
        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
            if(error){
                console.log(JSON.stringify(error))
                res.write(JSON.stringify(error));
                res.end();
            }else{
                res.redirect('/payment');
            }
        });
    });

    //display one payment for update
    router.get('/:id', function(req, res){
      callbackCount = 0;
      var context = {};
      context.jsscripts = ["selectedpayment.js", "update_item.js"];
      context.css = ["styles.css"]
      var mysql = req.app.get('mysql');
      getUpdate(res, mysql, context, req.params.id, complete);
      function complete(){
          callbackCount++;
          if(callbackCount >= 1){
              res.render('update-payment', context);
          }

      }
    });

    // The URI that update data is sent to in order to update a payment
    router.put('/:id', function(req, res){
        var mysql = req.app.get('mysql');
        //console.log(req.body)
        //console.log(req.params.id)
        var sql = "UPDATE payments SET payment_date=?, amount=?, type_payment=?, invoice_number=? WHERE transaction_id=?";
        var inserts = [req.body.payment_date, req.body.amount, req.body.type_payment, req.body.invoice_number, req.params.id];
        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
            if(error){
                console.log(error)
                res.write(JSON.stringify(error));
                res.end();
            }else{
                res.status(200);
                res.end();
            }
        });
    });

    // route to delete payment
    router.delete('/:id', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "DELETE FROM payments WHERE transaction_id = ?";
        var inserts = [req.params.id];
        sql = mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                console.log(error)
                res.write(JSON.stringify(error));
                res.status(400);
                res.end();
            }else{
                res.status(202).end();
            }
        })
    })

    return router;
}();
