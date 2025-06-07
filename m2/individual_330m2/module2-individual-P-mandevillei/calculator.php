<!--
Make a calculator using PHP and an HTML form. 
The form should have two number inputs. 
The form should submit a GET request either back to the same page or to a different results page. 
The calculator should support addition, subtraction, multiplication, and division 
by means of a radio button group on the page. (Consider edge cases!)
-->

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Simple Calculator</title>
</head>
<body>
    <header>
        Please keep your input within 2 decimal places.
    </header>

    <form method='GET'>
        <p>
            <label>Input first number here: <input type='number' name='num1' step=0.01> </label>
            <label>Input second number here: <input type='number' name='num2' step=0.01> </label>
        </p>
        <p>
            <label>Select your operation here: </label>
            <input type='radio' name='operator' value='0' id='addition'> <label>+</label> 
            <input type='radio' name='operator' value='1' id='subtraction'> <label>-</label>
            <input type='radio' name='operator' value='2' id='multiplication'> <label>&times;</label>
            <input type='radio' name='operator' value='3' id='division'> <label>&divide;</label>
        </p>
        <p>
            <input type='submit' value='Calculate'>
            <input type='reset'>
        </p>
    </form>
    
    <?php
    function error_exit($msg = "Invalid Input") {
        printf("<h1>%s</h1>\n", htmlentities($msg));
        echo "</body>\n";
        echo "</html>";
        exit;
    }
    $ADDITION = 0;
    $SUBTRACTION = 1;
    $MULTIPLICATION = 2;
    $DIVISION = 3;
    $OPERATIONS = array('+', '-', '&times;', '&divide;');

    if ($_GET['num1']==null || $_GET['num2']==null || $_GET['operator']==null) { // Check for complete input
        error_exit();
    }
    if (!(is_numeric($_GET['num1']) && is_numeric($_GET['num2']))) { // Check for numeric input
        error_exit();
    }
    $num1 = (double) $_GET['num1'];
    $num2 = (double) $_GET['num2'];
    $operator = (int) $_GET['operator'];
    if (!($operator==$ADDITION || $operator==$SUBTRACTION || $operator==$MULTIPLICATION || $operator==$DIVISION)) { 
        // Check radio categories
        error_exit();
    }
    if ($operator==$DIVISION and $num2==0) { // denominator cannot be zero
        error_exit("Error: Dividing By Zero");
    }

    $ans;
    switch ($operator) {
        case $ADDITION:
            $ans = $num1 + $num2;
            break;
        case $SUBTRACTION:
            $ans = $num1 - $num2;
            break;
        case $MULTIPLICATION:
            $ans = $num1 * $num2;
            break;
        case $DIVISION:
            $ans = $num1 / $num2;
            break;
    }
    printf("\t<h1>%.2f %s %.2f = %.2f</h1>", $num1, $OPERATIONS[$operator], $num2, $ans);
    ?>

</body>
</html>