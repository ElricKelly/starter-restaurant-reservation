import React from "react";
import { Redirect, Route, Switch} from "react-router-dom";
import Dashboard from "../dashboard/Dashboard";
import NotFound from "./NotFound";
import { today } from "../utils/date-time";
import useQuery from "../utils/useQuery";
import NewReservation from "./NewReservation";
import NewTable from "./NewTable";
import SeatReservation from "./SeatReservation";
import SearchDisplay from "./SearchDisplay";
import EditDisplay from "./EditDisplay";

/**
 * Defines all the routes for the application.
 *
 * You will need to make changes to this file.
 *
 * @returns {JSX.Element}
 */
function Routes() {
  const query = useQuery();
  const date = query.get("date");
  return (
    <Switch>
      <Route exact={true} path="/">
        <Redirect to={"/dashboard"} />
      </Route>
      <Route exact={true} path="/reservations">
        <Redirect to={"/dashboard"} />
      </Route>
      <Route path="/dashboard">
        <Dashboard date={date ? date : today()} />
      </Route>
      <Route exact={true} path="/reservations/new">
        <NewReservation />
      </Route>
      <Route exact={true} path="/reservations/:reservationId/seat">
        <SeatReservation />
      </Route>
      <Route exact={true} path="/reservations/:reservationId/edit">
        <EditDisplay />
      </Route>
      <Route exact={true} path="/tables/new">
        <NewTable />
      </Route>
      <Route exact={true} path="/search">
        <SearchDisplay date={date ? date : today()}/>
      </Route>
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

export default Routes;
