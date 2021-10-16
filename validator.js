const { body } = require('express-validator'),

SNIPPET_TITLE_MAX_LENGTH = 255,
SNIPPET_CODE_MAX_LENGTH = 5000,
FOLDER_MIN_LENGTH = 2,
FOLDER_MAX_LENGTH = 15,
CONTACT_NAME_MAX_LENGTH = 25,
CONTACT_EMAIL_MAX_LENGTH = 250,
CONTACT_MESSAGE_MIN_LENGTH = 10,
CONTACT_MESSAGE_MAX_LENGTH = 250,
LANGUAGE_MAX_LENGTH = 20

exports.addSnippetValidation = [
    body('title').notEmpty().withMessage('Title is required')
    .bail().isLength({max: SNIPPET_TITLE_MAX_LENGTH})
        .withMessage(`Title cannot be longer than ${SNIPPET_TITLE_MAX_LENGTH} characters`).trim(),
    body('folder').trim(),
    body('code').notEmpty().withMessage('Code is required')
        .bail().isLength({max: SNIPPET_CODE_MAX_LENGTH})
            .withMessage(`Code cannot be longer than ${SNIPPET_CODE_MAX_LENGTH} characters`).trim()
]

exports.snippetUpdateValidation = [
    body('title').notEmpty().withMessage('Title is required')
    .bail().isLength({max: SNIPPET_TITLE_MAX_LENGTH})
        .withMessage(`Title cannot be longer than ${SNIPPET_TITLE_MAX_LENGTH} characters`).trim(),
    body('folder').trim(),
    body('code').notEmpty().withMessage('Code is required')
        .bail().isLength({max: SNIPPET_CODE_MAX_LENGTH})
            .withMessage(`Code cannot be longer than ${SNIPPET_CODE_MAX_LENGTH} characters`).trim(),
    body('id').notEmpty().withMessage('Snippet id is required').trim()
]

exports.folderCreateValidation = [
    body('folderName').notEmpty().withMessage('Folder name is required')
        .bail().isLength({min: FOLDER_MIN_LENGTH, max: FOLDER_MAX_LENGTH})
            .withMessage(`Folder name must be between ${FOLDER_MIN_LENGTH} and ${FOLDER_MAX_LENGTH} characters`).trim()
]

exports.folderUpdateValidation = [
    body('folderName').notEmpty().withMessage('Folder name is required')
        .bail().isLength({min: FOLDER_MIN_LENGTH, max: FOLDER_MAX_LENGTH})
            .withMessage(`Folder name must be between ${FOLDER_MIN_LENGTH} and ${FOLDER_MAX_LENGTH} characters`).trim(),
    body('folderId').notEmpty().withMessage('Folder id is required').trim()
]

exports.contactValidation = [
    body('name').notEmpty().withMessage('Name is required')
        .bail().isLength({max: CONTACT_NAME_MAX_LENGTH})
            .withMessage(`Name cannot be longer than ${CONTACT_NAME_MAX_LENGTH} characters`).trim(),
    body('email').notEmpty().withMessage('Email is required')
        .bail().isLength({max: CONTACT_EMAIL_MAX_LENGTH}).withMessage(`Email cannot be longer than ${CONTACT_EMAIL_MAX_LENGTH} characters`).trim()
        .bail().isEmail().normalizeEmail().withMessage('Email is invalid').trim(),
    body('message').notEmpty().withMessage('Message is required')
        .bail().isLength({min: CONTACT_MESSAGE_MIN_LENGTH, max: CONTACT_MESSAGE_MAX_LENGTH})
            .withMessage(`Message must be between ${CONTACT_MESSAGE_MIN_LENGTH} and ${CONTACT_MESSAGE_MAX_LENGTH} characters`).trim()
]

exports.addLanguageValidation = [
    body('language').notEmpty().withMessage('Language is required')
        .bail().isLength({max: LANGUAGE_MAX_LENGTH})
            .withMessage(`Language cannot be longer than ${LANGUAGE_MAX_LENGTH} characters`).toLowerCase().trim()
]

exports.languageUpdateValidation = [
    body('languageName').notEmpty().withMessage('Language is required')
        .bail().isLength({ max: LANGUAGE_MAX_LENGTH})
            .withMessage(`Language cannot be longer than ${LANGUAGE_MAX_LENGTH} characters`).toLowerCase().trim(),
    body('languageId').notEmpty().withMessage('language id is required').trim()
]
