// Setup
var logic = new FuzzyLogic();

// Too wet is more than 70%, completely wet is 100%. Constant shape above 100%: it's still too wet!
var wet = logic.newSet("Wet", 60, 100, FuzzyShape.GAUSSIAN, FuzzyShape.CONSTANT);
// The comfort zone begins at 40%, and its most comfortable at 60%. We use the same shape above and below this comfort zone.
var comfortable = logic.newSet("Comfortable", 40, 55, FuzzyShape.SIGMOID);
// Too dry is less than 50%, completely dry is 0%. Constant shape under 0%: it's still too dry!
var dry = logic.newSet("Dry", 50, 0, FuzzyShape.CONSTANT, FuzzyShape.GAUSSIAN);

// Temperature
// The principle is the same than humidity.
var hot = logic.newSet("Hot", 21, 35, FuzzyShape.GAUSSIAN, FuzzyShape.CONSTANT);
var warm = logic.newSet("Comfortably warm", 17, 20, FuzzyShape.GAUSSIAN);
var cold = logic.newSet("Cold", 17, 10, FuzzyShape.CONSTANT, FuzzyShape.GAUSSIAN);
// Let's say a positive power (from 0% to 100%) heats the room, a negative one cools it.
var heat = logic.newSet("Heat", 0, 100, FuzzyShape.LINEAR, FuzzyShape.CONSTANT);
var refresh = logic.newSet("Refresh", 0, -100, FuzzyShape.CONSTANT, FuzzyShape.LINEAR);
// Change these values to test the engine
var temperature = logic.newValue( 20, "°C" );
var humidity = logic.newValue( 50 , "%" );
var hvacPower = logic.newValue( 0, "%" );
// Enable reports to be able to have a look at the result of the logic
hvacPower.reportEnabled = true;
// If it's hot, let's cool down
logic.IF( temperature.IS( hot ) ); 
logic.THEN( hvacPower, refresh  ); // Rule #1

// If it's cold, let's heat up
logic.IF( temperature.IS( cold ) ); 
logic.THEN( hvacPower, heat ); // Rule #2

// If it's hot and wet, we want to refresh more
logic.IF(
    temperature.IS( hot)
    .AND ( humidity.IS( wet ) )
);
logic.THEN( hvacPower, refresh, "More" ); // Rule #3

// If it's cold and wet, we want to heat more
logic.IF( 
    temperature.IS(cold)
    .AND ( humidity.IS( wet ) )
);
logic.THEN( hvacPower, heat, "More" ); // Rule #4

//If it's dry, we lower the power (because we don't want the hvac to make the air even drier)

// If it's cold but not too cold and it is dry, we want to heat less to save energy
logic.IF( 
    temperature.IS(cold)
    .AND ( temperature.IS_NOT( cold, "Extremely") )
    .AND ( humidity.IS( dry ) )
);
logic.THEN( hvacPower, heat, "Less" ); // Rule #5

// If it's hot but not too hot, and it is dry, we want to refresh less to save energy
logic.IF( 
    temperature.IS( hot )
    .AND ( temperature.IS_NOT( hot, "Extremely") )
    .AND ( humidity.IS( dry ) )
);
logic.THEN( hvacPower, refresh, "Less" ); // Rule #6

logic.IF(
    temperature.IS( warm, "very" )
    .OR ( temperature.IS(cold) )
    .AND ( humidity.IS( wet ) )
)
logic.THEN( hvacPower, heat, "Somewhat" ); // Rule #7

logic.IF( temperature.IS( warm ) );
logic.THEN( hvacPower, heat, "not"); // Rule #8
logic.THEN( hvacPower, refresh, "not"); // Rule #9

// Print the result
Print( temperature.toString( hot ) + " and " + temperature.toString( cold ) );
Print( humidity.toString(wet) + " and " + humidity.toString( dry )  );
Print( "" );
Print( temperature.toString( warm ) );
Print( humidity.toString( comfortable ) );
Print( "" );
Print( "RESULT: the power of the air conditionner is " + hvacPower.toString()  );
Print( "" );
Print( "This is how this result is obtained:")
for (var i = 0, num = hvacPower.report.length; i < num; i++)
{
    Print( "" );
    Print( hvacPower.report[i].join("<br />") );
}