import { Response } from "express"

export default class ResponseSend {
    static success(response: Response, result: any, statusCode: HttpStatusCodes = HttpStatusCodes.OK) {
        if(!response)return
        if(!result) throw new Error("[ResponseSend] No 'result' was passed")

        const obj: ResponseSend.TemplateSuccess = {
            statusCode,
            result
        }
        response.send(obj)
    }
    static error(response: Response, statusCode: HttpStatusCodes, message: string) {
        if(!response)return
        if(!message || !message.length) throw new Error("[ResponseSend] No 'message' was passed")
        if(!statusCode) throw new Error("[ResponseSend] No 'statusCode' was passed")
        if(!HttpStatusCodes[statusCode]) throw new Error("[ResponseSend] No 'statusCode' was passed")

        let error = HttpStatusCodes[statusCode].replace('_', ' ').toLowerCase()
        error = error[0].toUpperCase() + '' + error.slice(1, error.length)

        const obj: ResponseSend.TemplateError = {
            statusCode,
            message,
            error
        }

        response.status(statusCode)
        response.send(obj)
    }
}

namespace ResponseSend {
    export interface TemplateSuccess {
        statusCode: HttpStatusCodes
        result: any
    }
    export interface TemplateError {
        statusCode: HttpStatusCodes
        error: string
        message: string
    }
}


export enum HttpStatusCodes {
    // 100
    CONTINUE = 100,
    SWITCHING_PROTOCOLS = 101,
    PROCESSING = 102,
    EARLY_HINTS = 103,

    // 200
    OK = 200,
    CREATED = 201,
    ACCEPTED = 202,
    NON_AUTHORITATIVE_INFORMATION = 203,
    NO_CONTENT = 204,
    RESET_CONTENT = 205,
    PARTIAL_CONTENT = 206,
    MULTISTATUS = 207,
    ALREADY_REPORTED = 208,
    IM_USED = 226,

    // 300
    MULTIPLE_CHOICES = 300,
    MOVED_PERMANENTLY = 301,
    FOUND = 302,
    SEE_OTHER = 303,
    NOT_MODIFIED = 304,
    USE_PROXY = 305,
    SWITCH_PROXY = 306,
    TEMPORARY_REDIRECT = 307,
    PERMANENT_REDIRECT = 308,

    // 400
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    PAYMENT_REQUIRED = 402,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    METHOD_NOT_ALLOWED = 405,
    NOT_ACCEPTABLE = 406,
    PROXY_AUTHENTICATION_REQUIRED = 407,
    REQUEST_TIMEOUT = 408,
    CONFLICT = 409,
    GONE = 410,
    LENGTH_REQUIRED = 411,
    PRECONDITION_FAILED = 412,
    PAYLOAD_TOO_LARGE = 413,
    URI_TOO_LONG = 414,
    UNSUPPORTED_MEDIA_TYPE = 415,
    RANGE_NOT_SATISFIABLE = 416,
    EXPECTATION_FAILED = 417,
    MISDIRECTED_REQUEST = 421,
    UNPROCESSABLE_ENTITY = 422,
    LOCKED = 423,
    FAILE_DDEPENDENCY = 424,
    UPGRADE_REQUIRED = 426,
    PRECONDITION_REQUIRED = 428,
    TOO_MANY_REQUESTS = 429,
    REQUEST_HEADER_FIELDS_TOO_LARGE = 431,
    UNAVAILABLE_FOR_LEGAL_REASONS = 451,

    // 500
    INTERNAL_SERVER_ERROR = 500,
    NOT_IMPLEMENTED = 501,
    BAD_GATEWAY = 502,
    SERVICE_UNAVAILABLE = 503,
    GATEWAY_TIMEOUT = 504,
    HTTP_VERSION_NOT_SUPPORTED = 505,
    VARIANT_ALSO_NEGOTIATES = 506,
    INSUFFICIENT_STORAGE = 507,
    LOOP_DETECTED = 508,
    NOT_EXTENDED = 510,
    NETWORK_AUTHENTICATION_REQUIRED = 511,
}