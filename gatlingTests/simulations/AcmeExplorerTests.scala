package acmeexplorer

import scala.concurrent.duration._

import io.gatling.core.Predef._
import io.gatling.http.Predef._
import io.gatling.jdbc.Predef._
import scala.util.Random

class AcmeExplorerTests extends Simulation {

	val httpProtocol = http
		.baseUrl("http://localhost:8080/")		

	val headers_0 = Map(
		"Content-Type" -> "application/json")

	val feeder = Iterator.continually(Map(("email", "email"+Random.nextInt(150000)+Random.nextInt(150000)+"@fakemail.com")))

	//ACTORS
	object CreateExplorer {
		val createExplorer = exec(http("POST ACTOR EXPLORER")
			.post("v1/actors")
			.body(ElFileBody("../resources/acmeexplorer/actor-explorer.json"))
			.headers(headers_0))
		.pause(1)
	}
		
	//TRIPS
	object ShowAllTrips {
		val showAllTrips = exec(http("GET ALL TRIPS")
			.get("v1/trips/")
			.headers(headers_0))
		.pause(1)
	}
		
	object ShowTripsByKeyWord {
		val showTripsByKeyWord = exec(http("GET TRIPS BY KEYWORD")
			.get("v1/trips?keyword=lorem")
			.headers(headers_0))
		.pause(1)
	}
		
	object ShowPublishedTrips {
		val showPublishedTrips = exec(http("GET PUBLISHED TRIPS")
			.get("v1/trips?published=true")
			.headers(headers_0))
		.pause(1)
	}

	//SPONSORSHIPS
	object ShowAllSponsorships {
		val showAllSponsorships = exec(http("GET ALL SPONSORSHIPS")
			.get("v1/sponsorships/")
			.headers(headers_0))
		.pause(1)
	}

	val actorScn = scenario("Actors").feed(feeder).exec(CreateExplorer.createExplorer)

	val tripScn = scenario("Trips").exec(ShowAllTrips.showAllTrips,
									ShowTripsByKeyWord.showTripsByKeyWord,
									ShowPublishedTrips.showPublishedTrips
									)
	
	val sponsorshipScn = scenario("Sponsorships").exec(ShowAllSponsorships.showAllSponsorships)

	var numberOfUsers :Int = 40000;
	var durationInSeconds :Int = 60;
	var maximumResponseMaxTimeInMillisecondsExpected :Int = 5000;
	var maximumResponseMeanTimeInMillisecondsExpected :Int = 1000;
	var minimumSuccessPercentageExpected :Int = 95;

	setUp(
		actorScn.inject(rampUsers(numberOfUsers) during (durationInSeconds seconds)),
		tripScn.inject(rampUsers(numberOfUsers) during (durationInSeconds seconds)),
		sponsorshipScn.inject(rampUsers(numberOfUsers) during (durationInSeconds seconds))
	).protocols(httpProtocol)
     .assertions(
        global.responseTime.max.lt(maximumResponseMaxTimeInMillisecondsExpected),    
        global.responseTime.mean.lt(maximumResponseMeanTimeInMillisecondsExpected),
        global.successfulRequests.percent.gt(minimumSuccessPercentageExpected)
	)
}