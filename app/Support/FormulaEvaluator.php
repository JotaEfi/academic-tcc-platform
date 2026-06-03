<?php

namespace App\Support;

use Exception;

class FormulaEvaluator
{
    /**
     * Evaluate a mathematical formula with given variable values.
     *
     * @param string $formula E.g., "(P1 * 0.4) + (T1 * 0.6)"
     * @param array $variables E.g., ['P1' => 8.5, 'T1' => 9.0]
     * @return float
     * @throws Exception
     */
    public static function evaluate(string $formula, array $variables): float
    {
        $sanitized = self::sanitize($formula);
        $tokens = self::tokenize($sanitized);
        $rpn = self::shuntingYard($tokens);
        return self::evaluateRPN($rpn, $variables);
    }

    /**
     * Validate the syntax of a formula.
     *
     * @param string $formula
     * @param array $allowedCodes E.g., ['P1', 'T1', 'Proj']
     * @return bool
     */
    public static function validate(string $formula, array $allowedCodes): bool
    {
        try {
            $sanitized = self::sanitize($formula);
            $tokens = self::tokenize($sanitized);
            
            // Check parenthesis balance and variables
            $parentheses = 0;
            foreach ($tokens as $token) {
                if ($token === '(') {
                    $parentheses++;
                } elseif ($token === ')') {
                    $parentheses--;
                    if ($parentheses < 0) {
                        return false; // Closed parenthesis before open
                    }
                } elseif (preg_match('/^[a-zA-Z][a-zA-Z0-9]*$/', $token)) {
                    if (!in_array($token, $allowedCodes)) {
                        return false; // Unknown variable code
                    }
                }
            }

            if ($parentheses !== 0) {
                return false; // Unbalanced parentheses
            }

            // Verify it parses to RPN without error
            $rpn = self::shuntingYard($tokens);

            // Mock evaluation to ensure correct operations
            $mockVars = array_fill_keys($allowedCodes, 1.0);
            self::evaluateRPN($rpn, $mockVars);

            return true;
        } catch (Exception $e) {
            return false;
        }
    }

    /**
     * Sanitize formula to prevent malicious inputs.
     */
    private static function sanitize(string $formula): string
    {
        // Remove spaces
        $formula = str_replace(' ', '', $formula);

        // Only allow letters, numbers, basic operators, and parentheses
        if (preg_match('/[^a-zA-Z0-9\+\-\*\/\(\)\.]/', $formula)) {
            throw new Exception("Caracteres inválidos detectados na fórmula.");
        }

        return $formula;
    }

    /**
     * Tokenize expression into numbers, variables, and operators.
     */
    private static function tokenize(string $expression): array
    {
        $tokens = [];
        $i = 0;
        $len = strlen($expression);

        while ($i < $len) {
            $char = $expression[$i];

            if ($char === '(' || $char === ')' || in_array($char, ['+', '-', '*', '/'])) {
                $tokens[] = $char;
                $i++;
            } elseif (preg_match('/[0-9\.]/', $char)) {
                // Parse number
                $num = '';
                while ($i < $len && preg_match('/[0-9\.]/', $expression[$i])) {
                    $num .= $expression[$i];
                    $i++;
                }
                $tokens[] = $num;
            } elseif (preg_match('/[a-zA-Z]/', $char)) {
                // Parse variable
                $var = '';
                while ($i < $len && preg_match('/[a-zA-Z0-9]/', $expression[$i])) {
                    $var .= $expression[$i];
                    $i++;
                }
                $tokens[] = $var;
            } else {
                throw new Exception("Símbolo inválido: " . $char);
            }
        }

        return $tokens;
    }

    /**
     * Convert infix token array to postfix (RPN) using Shunting-Yard.
     */
    private static function shuntingYard(array $tokens): array
    {
        $output = [];
        $stack = [];
        $precedence = [
            '+' => 1,
            '-' => 1,
            '*' => 2,
            '/' => 2,
        ];

        foreach ($tokens as $token) {
            if (is_numeric($token) || preg_match('/^[a-zA-Z][a-zA-Z0-9]*$/', $token)) {
                $output[] = $token;
            } elseif (in_array($token, ['+', '-', '*', '/'])) {
                while (!empty($stack) && in_array(end($stack), ['+', '-', '*', '/'])) {
                    $top = end($stack);
                    if ($precedence[$token] <= $precedence[$top]) {
                        $output[] = array_pop($stack);
                    } else {
                        break;
                    }
                }
                $stack[] = $token;
            } elseif ($token === '(') {
                $stack[] = $token;
            } elseif ($token === ')') {
                $found = false;
                while (!empty($stack)) {
                    $top = array_pop($stack);
                    if ($top === '(') {
                        $found = true;
                        break;
                    }
                    $output[] = $top;
                }
                if (!$found) {
                    throw new Exception("Parênteses desbalanceados.");
                }
            }
        }

        while (!empty($stack)) {
            $top = array_pop($stack);
            if ($top === '(' || $top === ')') {
                throw new Exception("Parênteses desbalanceados.");
            }
            $output[] = $top;
        }

        return $output;
    }

    /**
     * Evaluate Postfix RPN queue using variables dictionary.
     */
    private static function evaluateRPN(array $rpn, array $variables): float
    {
        $stack = [];

        foreach ($rpn as $token) {
            if (is_numeric($token)) {
                $stack[] = (float)$token;
            } elseif (preg_match('/^[a-zA-Z][a-zA-Z0-9]*$/', $token)) {
                // If variable has no score defined, default to 0.0
                $stack[] = (float)($variables[$token] ?? 0.0);
            } elseif (in_array($token, ['+', '-', '*', '/'])) {
                if (count($stack) < 2) {
                    throw new Exception("Fórmula malformada: operandos insuficientes.");
                }

                $b = array_pop($stack);
                $a = array_pop($stack);

                switch ($token) {
                    case '+':
                        $stack[] = $a + $b;
                        break;
                    case '-':
                        $stack[] = $a - $b;
                        break;
                    case '*':
                        $stack[] = $a * $b;
                        break;
                    case '/':
                        if (abs($b) < 0.000001) {
                            $stack[] = 0.0; // Prevent Division-by-Zero crash by returning 0
                        } else {
                            $stack[] = $a / $b;
                        }
                        break;
                }
            }
        }

        if (count($stack) !== 1) {
            throw new Exception("Fórmula malformada: resultado final ambíguo.");
        }

        return round(array_pop($stack), 2);
    }
}
