

/**
 * @param {String} password
 */
export function checkPasswordStrength(password) {
    let strength = 0
    const failed = []
    const passed = []

    const failAllRules = () => {
        failed.push(MinimumLengthRule.message)
        Rules.forEach(rule => failed.push(rule.message))
    }

    if (!password)
        failAllRules()
    else {
        if (!MinimumLengthRule.validate(password))
            failAllRules()
        else {
            strength += 1
            passed.push(MinimumLengthRule.message)
    
            Rules.forEach(rule => {
                if (rule.validate(password)) {
                    strength += 1
                    passed.push(rule.message)
                } else {
                    failed.push(rule.message)
                }
            })
        }
    }

    return {
        strength: PasswordStrength[strength],
        failed,
        passed,
    }
}

/**
 * 
 * @param {String} password
 */
export function isPasswordReliable(password) {
    const { strength } = checkPasswordStrength(password)
    return strength != Unreliable
}

export const MinimumLength = 6
export const Unreliable = 'Unreliable'
const Unhackable = 'Unhackable'

const PasswordStrength = [
    Unreliable,
    'Weak',
    'Regular',
    'Strong',
    'Very Strong',
    Unhackable,
]

/* #region Rules */

const MinimumLengthRule = {
    message: `Has at least ${MinimumLength} characters`,
    validate: (password) => password != undefined && password != null && password.length >= MinimumLength,
}

const LowercaseLetterRule = {
    message: 'Contains a lowercase letter',
    validate: (password) => password != undefined && password != null && password.match(/[a-z]+/),
}

const UppercaseLetterRule = {
    message: 'Contains an uppercase letter',
    validate: (password) => password != undefined && password != null && password.match(/[A-Z]+/),
}

const NumberRule = {
    message: 'Contains a number',
    validate: (password) => password != undefined && password != null && password.match(/[0-9]+/),
}

const SpecialCharacterRule = {
    message: 'Contains a special character',
    validate: (password) => password != undefined && password != null && password.match(/[$@#&!]+/),
}

const Rules = [
    LowercaseLetterRule,
    UppercaseLetterRule,
    NumberRule,
    SpecialCharacterRule,
]

/* #endregion */
