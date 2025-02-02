const tablesService = require("./tables.service");
const reservationsService = require("../reservations/reservations.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");

function isTableValid(req, res, next){
  if(res.locals.table.reservation_id){
    return next({
      status: 400,
      message: `Table is occupied.`,
    });
  }
  if(res.locals.reservation.people > res.locals.table.capacity){
    return next({
      status: 400,
      message: `Table does not have sufficient capacity.`,
    });
  }
  if(res.locals.reservation.status === 'seated' || res.locals.reservation.status === 'finished'){
    return next({
      status: 400,
      message: `Reservation is already seated.`,
    });
  } 
  return next();
}

async function isTableOpen(req, res, next) {
  if(!req.body.data){
    return next({
      status: 400,
      message: `Data is missing.`,
    });
  }
  const reservationId = req.body.data.reservation_id;
  if (!reservationId) {
    next({ status: 400, message: `reservation_id is missing.` });
  }
  const foundReservation = await reservationsService.read(reservationId);
  if (foundReservation) {
    res.locals.reservation = foundReservation;
  } else {
    next({ status: 404, message: `reservation_id: ${reservationId} does not exist.` });
  }
  if (!res.locals.table.reservationId) {
    next();
  }
}

// function isReservationAlreadySeated(req, res, body){
//   const resStatus = req.body.data.status;
//   if(resStatus === 'seated'){
//     next({ status: 400, message: `Reservation is already seated.` });
//   } else {
//    next();
//   }
  
// }

async function isTableOccupied(req, res, next){
  if (res.locals.table.reservation_id) {
    next();
  }
  if (!res.locals.table.reservation_id) {
    next({ status: 400, message: `Table is not occupied.` });
  }
}

async function tableExists(req, res, next) {
  const foundTable = await tablesService.read(req.params.tableId);
  if (foundTable) {
    res.locals.table = foundTable;
    return next();
  }
  next({ status: 404, message: `Table ${req.params.tableId} cannot be found.` });
}

function validateTableBody(req, res, next) {
  const { data: { table_name, capacity } = {} } = req.body;
  let message = [];

  if (!table_name || table_name === "" || table_name.length < 2) {
    message.push(
      "table_name is a required field and must be longer than 2 characters."
    );
  }
  if (
    !capacity ||
    capacity === "" ||
    capacity < 1 ||
    typeof capacity !== "number"
  ) {
    message.push("capacity is a required field and must be at least 1.");
  }

  if (message.length > 0) {
    return next({
      status: 400,
      message: message[0],
    });
  } else {
    next();
  }
}

async function create(req, res, next) {
  const { data: { table_name, capacity, reservation_id } = {} } = req.body;
  const newTable = {
    table_name,
    capacity,
    reservation_id
  };
  const reallyNewTable = await tablesService.create(newTable);
  res.status(201).json({ data: reallyNewTable });
}

async function list(req, res) {
  let data = await tablesService.list();
  res.json({
    data: data,
  });
}

async function update(req, res, next) {
  const tableId = res.locals.table.table_id;
  const reservationId = res.locals.reservation.reservation_id;
  const updatedTable = await tablesService.setReservationId(tableId, reservationId);
  res.status(200).json({ data: updatedTable });
}

async function destroy(req, res, next){
  const tableId = res.locals.table.table_id;
  const reservationId = res.locals.table.reservation_id;
  await tablesService.destroy(tableId, reservationId);
  res.status(200).json({ data: "good delete" });
}

module.exports = {
  list: asyncErrorBoundary(list),
  create: [validateTableBody, asyncErrorBoundary(create)],
  update: [
    asyncErrorBoundary(tableExists),
    asyncErrorBoundary(isTableOpen),
    isTableValid,
    asyncErrorBoundary(update)
  ],
  destroy: [
    asyncErrorBoundary(tableExists),
    asyncErrorBoundary(isTableOccupied),
    asyncErrorBoundary(destroy)
  ]
};
