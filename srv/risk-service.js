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
     this.after("READ", Risks, (data)=> {
         const risks = Array.isArray(data) ? data : [data];

         risks.forEach(risk => {
            risk.criticality  = risk.impact >= 100000 ? 1 : 2;
         });
     })
 })