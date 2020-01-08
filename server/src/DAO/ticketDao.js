//@flow
const Dao = require("./dao.js");

module.exports = class ticketDao extends Dao {
    getAllTickets(callback: function) {
        super.query(
            "SELECT * FROM ticket ", [], callback
        );
    }

    getTicket(event_id: number, callback: function) {
        super.query(
            "SELECT * FROM ticket WHERE event_id = ?", [event_id],
            callback
        );
    }

    getNumberOfRemainingTickets(event_id: number, callback: function) {
        super.query(
            "SELECT amount-amount_sold AS remaining FROM ticket ", [event_id],
            callback
        );
    }

    addTicket(json: { ticket_type: string, amount: number, description: string, price: number, amount_sold: number}, callback: function) {
        super.query(
            "INSERT INTO ticket(ticket_type, amount, description, price, amount_sold) VALUES (?,?,?,?,?)",
            [json.ticket_type, json.amount,json.description, json.price, json.amount, json.amount_sold], callback
        );
    }

    deleteTicket(ticket_id: number, callback: function){
        super.query(
            "DELETE FROM ticket WHERE ticket_id = ?", [ticket_id],
            callback
        )
    }

    updateTicket(json: {ticket_id: number, ticket_type: string, amount: number, description: string, price: number, amount_sold: number}, callback: function){
       super.query(
           "UPDATE ticket SET ticket_type = ?, amount = ?, description = ?, price = ?, amount_sold = ? WHERE ticket_id = ?",
           [json.ticket_type, json.amount, json.description, json.price, json.amount_sold], callback
       );
    }
};
