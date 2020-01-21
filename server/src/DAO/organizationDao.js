//@flow
const Dao = require("./dao.js");
const imageUrl = "https://storage.cloud.google.com/harmoni-files/";

module.exports = class organizationDao extends Dao {
    getAllOrganizations(callback: function) {
        super.query(
            "SELECT * FROM organization ", [], callback
        );
    }

    getOrganization(org_id: number, callback: function) {
        super.query(
            "SELECT * FROM organization WHERE org_id = ?", [org_id],
            callback
        );
    }

    getOrgByEmail(email: string, callback: function) {
        super.query(
            "SELECT * FROM organization WHERE email = ?", [email],
            callback
        );
    }
    getOrgByUserEmail(email: string, callback: function) {
        super.query(
            "SELECT organization.org_id, organization.org_name, organization.email, organization.phone FROM organization JOIN user on( user.org_id = organization.org_id) WHERE user.email = ?",
            [email], callback
        );
}

    addOrganization(json: {org_name: string, phone: string, email: string}, callback: function) {
        super.query(
            "INSERT INTO organization(org_name, phone, email) VALUES (?,?,?)",
            [json.org_name, json.phone, json.email], callback
        );
    }

    deleteOrganization(org_id: number, callback: function){
        super.query(
            "DELETE FROM organization WHERE org_id = ?", [org_id],
            callback
        );
    }

    updateOrganization(org_id: number,json: { org_name: string, phone: string, email: string}, callback: function){
        super.query(
            "UPDATE organization SET org_name = ?, phone = ?, email = ? WHERE org_id = ?",
            [json.org_name, json.phone, json.email, org_id], callback
        );
    }

    updateOrgImage(org_id: number, image: string, callback: function){
        super.query("UPDATE organization SET image=? WHERE org_id=?", [imageUrl + image, org_id], callback);
    }
};
