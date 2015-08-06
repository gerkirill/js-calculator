'use strict'

var OPERATOR_PRIORITY = {
    HIGH: 2,
    MEDIUM: 1,
    LOW: 0
}

function Operator(symbol, priority, evalFunc, arity) {
    this.symbol = symbol;
    this.priority = priority;
    this.evalFunc = evalFunc;
    this.arity = (typeof arity == "undefined") ? 2 : arity;
}

function OperatorRepository(){
    this.operators = {};
}
OperatorRepository.prototype.getOperatorBySymbol = function(symbol) {
    if (!this.hasOperatorWithSymbol(symbol)) throw "Unknown operator: '" + symbol + "'";
    return this.operators[symbol];
}
OperatorRepository.prototype.hasOperatorWithSymbol = function(symbol) {
    return (typeof this.operators[symbol] != "undefined");
}
OperatorRepository.prototype.addOperator = function(operator) {
    this.operators[operator.symbol] = operator;
}

function OperandStack() {
    this.stack = [];
}
OperandStack.prototype.addOperand = function(operand) {
    this.stack.push(operand);
}
OperandStack.prototype.applyOperator = function(operator) {
    //operator.eval(two last values in stack, put back to stack)
    var args = [];
    for (var i=0; i<operator.arity; i++) {
        args.unshift(this.stack.pop());
    }
    this.stack.push(operator.evalFunc.apply(operator, args));
}
OperandStack.prototype.getResult = function() {
   //make sure length is 1 and return or throw exception 
   if (this.stack.length !== 1) throw "There should be exactly one value in operand stack, but it is " + this.stack.length + " here";
   return this.stack[0];
}
OperandStack.prototype.clear = function() {
    this.stack.length = 0;
}

function OperatorStack(){
    this.stack = [];
}
OperatorStack.prototype.push = function(operator) {
    //returns or throws popped out values
    var pushedOut = [];
    // while operator prio less or equal to the last one in stack - 
    // pop out operator, operandStack.applyOperator(operator)
    // operatorStack.push(operator)
    while(this.stack.length && operator.priority <= this.stack[this.stack.length-1].priority) {
        pushedOut.push(this.stack.pop());
    }
    this.stack.push(operator);
    return pushedOut;
}
OperatorStack.prototype.pop = function() {
    //just returns pop value
    return this.stack.pop();
}
OperatorStack.prototype.getLength = function() {
    return this.stack.length;
}
OperatorStack.prototype.clear = function() {
    this.stack.length = 0;
}

function Calculator() {
    this.operandStack = new OperandStack();
    this.operators = new OperatorRepository();
    this.operatorStack = new OperatorStack();
    this.setupOperators();
}

Calculator.prototype.setupOperators = function() {
    this.operators.addOperator(new Operator('*', OPERATOR_PRIORITY.MEDIUM, function(x, y) { return x * y }));
    this.operators.addOperator(new Operator('/', OPERATOR_PRIORITY.MEDIUM, function(x, y) { return x / y }));
    this.operators.addOperator(new Operator('+', OPERATOR_PRIORITY.LOW, function(x, y) { return x + y }));
    this.operators.addOperator(new Operator('-', OPERATOR_PRIORITY.LOW, function(x, y) { return x - y }));
    this.operators.addOperator(new Operator('v', OPERATOR_PRIORITY.HIGH, function(x) { return Math.sqrt(x) }, 1));
}
Calculator.prototype.calculate = function(tokens) {
    this.operandStack.clear();
    this.operatorStack.clear();
    this.processAllTokens(tokens);
    this.emptyOperatorStack();
    return this.operandStack.getResult();
}

Calculator.prototype.processAllTokens = function(tokens) {
    var operandStack = this.operandStack;
    for (var i =0; i<tokens.length; i++) {
        var token = tokens[i];
        if (this.operators.hasOperatorWithSymbol(token)) {
            var operator = this.operators.getOperatorBySymbol(token);
            var pushedOutOperators = this.operatorStack.push(operator);
            pushedOutOperators.forEach(function(pushedOutOperator) {
                operandStack.applyOperator(pushedOutOperator);
            });
        } else {
            operandStack.addOperand(token);
        }
    }
}

Calculator.prototype.emptyOperatorStack = function() {
    // for all values left in operatorStack - pop out and apply to operandStack
    while(this.operatorStack.getLength() > 0) {
        this.operandStack.applyOperator(this.operatorStack.pop());
    }
}

/*
var calculator = new Calculator();
var tokens = [-2, "+", 3, "*", 3, "/", 2, "+", "v", 4];
console.log(calculator.calculate(tokens));
*/