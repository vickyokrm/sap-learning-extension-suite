//Imports
const cds = require("@sap/cds");


/**
 * The service implementation with all the service handlers
 */

module.exports = cds.service.impl(async function () {

    const { Risks, BusinessPartners } = this.entities;

    /**
     * Set criticality after a READ operation on /risks
     */
    this.after("READ", Risks, (data) => {
        const risks = Array.isArray(data) ? data : [data];

        risks.forEach(risk => {
            risk.criticality = risk.impact >= 100000 ? 1 : 2;
        });
    })

    //Connect  to the external business partner service.

    const BPSrv = await cds.connect.to("API_BUSINESS_PARTNER");

    //Redirect requests

    /**
     * Event handler for read-events on the Business Partner entity
     * Each request to the API Business Hub requires the apikey in the header
     */

    this.on("READ", BusinessPartners, async (req) => {

        req.query.where("LastName <> '' and FirstName <> ''");

        return await BPSrv.transaction(req).send({
            query: req.query,
            headers: {
                apikey: process.env.apikey
            }
        })
    })

    // Risks?expand=bp($select=BusinessPartner)
    this.on('READ', Risks, async (req, next)=> {
        try {
            const res = await next();
            await Promise.all(
                res.map(async (risk)=> {
                    const bp = await BPSrv.transaction(req).send({
                        query: SELECT.one(this.entities.BusinessPartners)
                        .where({ BusinessPartner: risk.bp_BusinessPartner})
                        .columns(["BusinessPartner", "LastName", "FirstName"]),
                        headers: {
                            apikey: process.env.apikey
                        },
                    });
                    risk.bp = bp;
                })
            )
        } catch (error) {
            // do nothing
        }
    })
})

