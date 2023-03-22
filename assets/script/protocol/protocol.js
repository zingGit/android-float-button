/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
"use strict";

var $protobuf = require("protobufjs/minimal");

// Common aliases
var $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
var $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

$root.common = (function() {

    /**
     * Namespace common.
     * @exports common
     * @namespace
     */
    var common = {};

    /**
     * CMD enum.
     * @name common.CMD
     * @enum {number}
     * @property {number} INVALID=0 INVALID value
     * @property {number} LOGIN_REQ=1 LOGIN_REQ value
     * @property {number} LOGIN_RESP=2 LOGIN_RESP value
     * @property {number} PING_REQ=3 PING_REQ value
     * @property {number} PING_RESP=4 PING_RESP value
     */
    common.CMD = (function() {
        var valuesById = {}, values = Object.create(valuesById);
        values[valuesById[0] = "INVALID"] = 0;
        values[valuesById[1] = "LOGIN_REQ"] = 1;
        values[valuesById[2] = "LOGIN_RESP"] = 2;
        values[valuesById[3] = "PING_REQ"] = 3;
        values[valuesById[4] = "PING_RESP"] = 4;
        return values;
    })();

    common.LoginRequest = (function() {

        /**
         * Properties of a LoginRequest.
         * @memberof common
         * @interface ILoginRequest
         * @property {number|null} [userId] LoginRequest userId
         * @property {string|null} [token] LoginRequest token
         */

        /**
         * Constructs a new LoginRequest.
         * @memberof common
         * @classdesc Represents a LoginRequest.
         * @implements ILoginRequest
         * @constructor
         * @param {common.ILoginRequest=} [properties] Properties to set
         */
        function LoginRequest(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * LoginRequest userId.
         * @member {number} userId
         * @memberof common.LoginRequest
         * @instance
         */
        LoginRequest.prototype.userId = 0;

        /**
         * LoginRequest token.
         * @member {string} token
         * @memberof common.LoginRequest
         * @instance
         */
        LoginRequest.prototype.token = "";

        /**
         * Creates a new LoginRequest instance using the specified properties.
         * @function create
         * @memberof common.LoginRequest
         * @static
         * @param {common.ILoginRequest=} [properties] Properties to set
         * @returns {common.LoginRequest} LoginRequest instance
         */
        LoginRequest.create = function create(properties) {
            return new LoginRequest(properties);
        };

        /**
         * Encodes the specified LoginRequest message. Does not implicitly {@link common.LoginRequest.verify|verify} messages.
         * @function encode
         * @memberof common.LoginRequest
         * @static
         * @param {common.ILoginRequest} message LoginRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        LoginRequest.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.userId != null && Object.hasOwnProperty.call(message, "userId"))
                writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.userId);
            if (message.token != null && Object.hasOwnProperty.call(message, "token"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.token);
            return writer;
        };

        /**
         * Encodes the specified LoginRequest message, length delimited. Does not implicitly {@link common.LoginRequest.verify|verify} messages.
         * @function encodeDelimited
         * @memberof common.LoginRequest
         * @static
         * @param {common.ILoginRequest} message LoginRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        LoginRequest.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a LoginRequest message from the specified reader or buffer.
         * @function decode
         * @memberof common.LoginRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {common.LoginRequest} LoginRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        LoginRequest.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.common.LoginRequest();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1: {
                        message.userId = reader.uint32();
                        break;
                    }
                case 2: {
                        message.token = reader.string();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a LoginRequest message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof common.LoginRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {common.LoginRequest} LoginRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        LoginRequest.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a LoginRequest message.
         * @function verify
         * @memberof common.LoginRequest
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        LoginRequest.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.userId != null && message.hasOwnProperty("userId"))
                if (!$util.isInteger(message.userId))
                    return "userId: integer expected";
            if (message.token != null && message.hasOwnProperty("token"))
                if (!$util.isString(message.token))
                    return "token: string expected";
            return null;
        };

        /**
         * Creates a LoginRequest message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof common.LoginRequest
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {common.LoginRequest} LoginRequest
         */
        LoginRequest.fromObject = function fromObject(object) {
            if (object instanceof $root.common.LoginRequest)
                return object;
            var message = new $root.common.LoginRequest();
            if (object.userId != null)
                message.userId = object.userId >>> 0;
            if (object.token != null)
                message.token = String(object.token);
            return message;
        };

        /**
         * Creates a plain object from a LoginRequest message. Also converts values to other types if specified.
         * @function toObject
         * @memberof common.LoginRequest
         * @static
         * @param {common.LoginRequest} message LoginRequest
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        LoginRequest.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.userId = 0;
                object.token = "";
            }
            if (message.userId != null && message.hasOwnProperty("userId"))
                object.userId = message.userId;
            if (message.token != null && message.hasOwnProperty("token"))
                object.token = message.token;
            return object;
        };

        /**
         * Converts this LoginRequest to JSON.
         * @function toJSON
         * @memberof common.LoginRequest
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        LoginRequest.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for LoginRequest
         * @function getTypeUrl
         * @memberof common.LoginRequest
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        LoginRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/common.LoginRequest";
        };

        return LoginRequest;
    })();

    common.LoginResponse = (function() {

        /**
         * Properties of a LoginResponse.
         * @memberof common
         * @interface ILoginResponse
         * @property {number|null} [code] LoginResponse code
         * @property {number|null} [userId] LoginResponse userId
         */

        /**
         * Constructs a new LoginResponse.
         * @memberof common
         * @classdesc Represents a LoginResponse.
         * @implements ILoginResponse
         * @constructor
         * @param {common.ILoginResponse=} [properties] Properties to set
         */
        function LoginResponse(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * LoginResponse code.
         * @member {number} code
         * @memberof common.LoginResponse
         * @instance
         */
        LoginResponse.prototype.code = 0;

        /**
         * LoginResponse userId.
         * @member {number} userId
         * @memberof common.LoginResponse
         * @instance
         */
        LoginResponse.prototype.userId = 0;

        /**
         * Creates a new LoginResponse instance using the specified properties.
         * @function create
         * @memberof common.LoginResponse
         * @static
         * @param {common.ILoginResponse=} [properties] Properties to set
         * @returns {common.LoginResponse} LoginResponse instance
         */
        LoginResponse.create = function create(properties) {
            return new LoginResponse(properties);
        };

        /**
         * Encodes the specified LoginResponse message. Does not implicitly {@link common.LoginResponse.verify|verify} messages.
         * @function encode
         * @memberof common.LoginResponse
         * @static
         * @param {common.ILoginResponse} message LoginResponse message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        LoginResponse.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.code != null && Object.hasOwnProperty.call(message, "code"))
                writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.code);
            if (message.userId != null && Object.hasOwnProperty.call(message, "userId"))
                writer.uint32(/* id 2, wireType 0 =*/16).uint32(message.userId);
            return writer;
        };

        /**
         * Encodes the specified LoginResponse message, length delimited. Does not implicitly {@link common.LoginResponse.verify|verify} messages.
         * @function encodeDelimited
         * @memberof common.LoginResponse
         * @static
         * @param {common.ILoginResponse} message LoginResponse message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        LoginResponse.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a LoginResponse message from the specified reader or buffer.
         * @function decode
         * @memberof common.LoginResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {common.LoginResponse} LoginResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        LoginResponse.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.common.LoginResponse();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1: {
                        message.code = reader.uint32();
                        break;
                    }
                case 2: {
                        message.userId = reader.uint32();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a LoginResponse message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof common.LoginResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {common.LoginResponse} LoginResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        LoginResponse.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a LoginResponse message.
         * @function verify
         * @memberof common.LoginResponse
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        LoginResponse.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.code != null && message.hasOwnProperty("code"))
                if (!$util.isInteger(message.code))
                    return "code: integer expected";
            if (message.userId != null && message.hasOwnProperty("userId"))
                if (!$util.isInteger(message.userId))
                    return "userId: integer expected";
            return null;
        };

        /**
         * Creates a LoginResponse message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof common.LoginResponse
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {common.LoginResponse} LoginResponse
         */
        LoginResponse.fromObject = function fromObject(object) {
            if (object instanceof $root.common.LoginResponse)
                return object;
            var message = new $root.common.LoginResponse();
            if (object.code != null)
                message.code = object.code >>> 0;
            if (object.userId != null)
                message.userId = object.userId >>> 0;
            return message;
        };

        /**
         * Creates a plain object from a LoginResponse message. Also converts values to other types if specified.
         * @function toObject
         * @memberof common.LoginResponse
         * @static
         * @param {common.LoginResponse} message LoginResponse
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        LoginResponse.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.code = 0;
                object.userId = 0;
            }
            if (message.code != null && message.hasOwnProperty("code"))
                object.code = message.code;
            if (message.userId != null && message.hasOwnProperty("userId"))
                object.userId = message.userId;
            return object;
        };

        /**
         * Converts this LoginResponse to JSON.
         * @function toJSON
         * @memberof common.LoginResponse
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        LoginResponse.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for LoginResponse
         * @function getTypeUrl
         * @memberof common.LoginResponse
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        LoginResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/common.LoginResponse";
        };

        return LoginResponse;
    })();

    common.Ping = (function() {

        /**
         * Properties of a Ping.
         * @memberof common
         * @interface IPing
         * @property {number|Long|null} [clientTime] Ping clientTime
         */

        /**
         * Constructs a new Ping.
         * @memberof common
         * @classdesc Represents a Ping.
         * @implements IPing
         * @constructor
         * @param {common.IPing=} [properties] Properties to set
         */
        function Ping(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Ping clientTime.
         * @member {number|Long} clientTime
         * @memberof common.Ping
         * @instance
         */
        Ping.prototype.clientTime = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * Creates a new Ping instance using the specified properties.
         * @function create
         * @memberof common.Ping
         * @static
         * @param {common.IPing=} [properties] Properties to set
         * @returns {common.Ping} Ping instance
         */
        Ping.create = function create(properties) {
            return new Ping(properties);
        };

        /**
         * Encodes the specified Ping message. Does not implicitly {@link common.Ping.verify|verify} messages.
         * @function encode
         * @memberof common.Ping
         * @static
         * @param {common.IPing} message Ping message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Ping.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.clientTime != null && Object.hasOwnProperty.call(message, "clientTime"))
                writer.uint32(/* id 1, wireType 0 =*/8).uint64(message.clientTime);
            return writer;
        };

        /**
         * Encodes the specified Ping message, length delimited. Does not implicitly {@link common.Ping.verify|verify} messages.
         * @function encodeDelimited
         * @memberof common.Ping
         * @static
         * @param {common.IPing} message Ping message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Ping.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Ping message from the specified reader or buffer.
         * @function decode
         * @memberof common.Ping
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {common.Ping} Ping
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Ping.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.common.Ping();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1: {
                        message.clientTime = reader.uint64();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a Ping message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof common.Ping
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {common.Ping} Ping
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Ping.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Ping message.
         * @function verify
         * @memberof common.Ping
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Ping.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.clientTime != null && message.hasOwnProperty("clientTime"))
                if (!$util.isInteger(message.clientTime) && !(message.clientTime && $util.isInteger(message.clientTime.low) && $util.isInteger(message.clientTime.high)))
                    return "clientTime: integer|Long expected";
            return null;
        };

        /**
         * Creates a Ping message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof common.Ping
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {common.Ping} Ping
         */
        Ping.fromObject = function fromObject(object) {
            if (object instanceof $root.common.Ping)
                return object;
            var message = new $root.common.Ping();
            if (object.clientTime != null)
                if ($util.Long)
                    (message.clientTime = $util.Long.fromValue(object.clientTime)).unsigned = true;
                else if (typeof object.clientTime === "string")
                    message.clientTime = parseInt(object.clientTime, 10);
                else if (typeof object.clientTime === "number")
                    message.clientTime = object.clientTime;
                else if (typeof object.clientTime === "object")
                    message.clientTime = new $util.LongBits(object.clientTime.low >>> 0, object.clientTime.high >>> 0).toNumber(true);
            return message;
        };

        /**
         * Creates a plain object from a Ping message. Also converts values to other types if specified.
         * @function toObject
         * @memberof common.Ping
         * @static
         * @param {common.Ping} message Ping
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Ping.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults)
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.clientTime = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.clientTime = options.longs === String ? "0" : 0;
            if (message.clientTime != null && message.hasOwnProperty("clientTime"))
                if (typeof message.clientTime === "number")
                    object.clientTime = options.longs === String ? String(message.clientTime) : message.clientTime;
                else
                    object.clientTime = options.longs === String ? $util.Long.prototype.toString.call(message.clientTime) : options.longs === Number ? new $util.LongBits(message.clientTime.low >>> 0, message.clientTime.high >>> 0).toNumber(true) : message.clientTime;
            return object;
        };

        /**
         * Converts this Ping to JSON.
         * @function toJSON
         * @memberof common.Ping
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Ping.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Ping
         * @function getTypeUrl
         * @memberof common.Ping
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Ping.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/common.Ping";
        };

        return Ping;
    })();

    common.Pong = (function() {

        /**
         * Properties of a Pong.
         * @memberof common
         * @interface IPong
         * @property {number|Long|null} [clientTime] Pong clientTime
         */

        /**
         * Constructs a new Pong.
         * @memberof common
         * @classdesc Represents a Pong.
         * @implements IPong
         * @constructor
         * @param {common.IPong=} [properties] Properties to set
         */
        function Pong(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Pong clientTime.
         * @member {number|Long} clientTime
         * @memberof common.Pong
         * @instance
         */
        Pong.prototype.clientTime = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * Creates a new Pong instance using the specified properties.
         * @function create
         * @memberof common.Pong
         * @static
         * @param {common.IPong=} [properties] Properties to set
         * @returns {common.Pong} Pong instance
         */
        Pong.create = function create(properties) {
            return new Pong(properties);
        };

        /**
         * Encodes the specified Pong message. Does not implicitly {@link common.Pong.verify|verify} messages.
         * @function encode
         * @memberof common.Pong
         * @static
         * @param {common.IPong} message Pong message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Pong.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.clientTime != null && Object.hasOwnProperty.call(message, "clientTime"))
                writer.uint32(/* id 1, wireType 0 =*/8).uint64(message.clientTime);
            return writer;
        };

        /**
         * Encodes the specified Pong message, length delimited. Does not implicitly {@link common.Pong.verify|verify} messages.
         * @function encodeDelimited
         * @memberof common.Pong
         * @static
         * @param {common.IPong} message Pong message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Pong.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Pong message from the specified reader or buffer.
         * @function decode
         * @memberof common.Pong
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {common.Pong} Pong
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Pong.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.common.Pong();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1: {
                        message.clientTime = reader.uint64();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a Pong message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof common.Pong
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {common.Pong} Pong
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Pong.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Pong message.
         * @function verify
         * @memberof common.Pong
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Pong.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.clientTime != null && message.hasOwnProperty("clientTime"))
                if (!$util.isInteger(message.clientTime) && !(message.clientTime && $util.isInteger(message.clientTime.low) && $util.isInteger(message.clientTime.high)))
                    return "clientTime: integer|Long expected";
            return null;
        };

        /**
         * Creates a Pong message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof common.Pong
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {common.Pong} Pong
         */
        Pong.fromObject = function fromObject(object) {
            if (object instanceof $root.common.Pong)
                return object;
            var message = new $root.common.Pong();
            if (object.clientTime != null)
                if ($util.Long)
                    (message.clientTime = $util.Long.fromValue(object.clientTime)).unsigned = true;
                else if (typeof object.clientTime === "string")
                    message.clientTime = parseInt(object.clientTime, 10);
                else if (typeof object.clientTime === "number")
                    message.clientTime = object.clientTime;
                else if (typeof object.clientTime === "object")
                    message.clientTime = new $util.LongBits(object.clientTime.low >>> 0, object.clientTime.high >>> 0).toNumber(true);
            return message;
        };

        /**
         * Creates a plain object from a Pong message. Also converts values to other types if specified.
         * @function toObject
         * @memberof common.Pong
         * @static
         * @param {common.Pong} message Pong
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Pong.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults)
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.clientTime = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.clientTime = options.longs === String ? "0" : 0;
            if (message.clientTime != null && message.hasOwnProperty("clientTime"))
                if (typeof message.clientTime === "number")
                    object.clientTime = options.longs === String ? String(message.clientTime) : message.clientTime;
                else
                    object.clientTime = options.longs === String ? $util.Long.prototype.toString.call(message.clientTime) : options.longs === Number ? new $util.LongBits(message.clientTime.low >>> 0, message.clientTime.high >>> 0).toNumber(true) : message.clientTime;
            return object;
        };

        /**
         * Converts this Pong to JSON.
         * @function toJSON
         * @memberof common.Pong
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Pong.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Pong
         * @function getTypeUrl
         * @memberof common.Pong
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Pong.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/common.Pong";
        };

        return Pong;
    })();

    common.CallResult = (function() {

        /**
         * Properties of a CallResult.
         * @memberof common
         * @interface ICallResult
         * @property {number|null} [code] CallResult code
         * @property {string|null} [message] CallResult message
         * @property {Uint8Array|null} [data] CallResult data
         */

        /**
         * Constructs a new CallResult.
         * @memberof common
         * @classdesc Represents a CallResult.
         * @implements ICallResult
         * @constructor
         * @param {common.ICallResult=} [properties] Properties to set
         */
        function CallResult(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * CallResult code.
         * @member {number} code
         * @memberof common.CallResult
         * @instance
         */
        CallResult.prototype.code = 0;

        /**
         * CallResult message.
         * @member {string} message
         * @memberof common.CallResult
         * @instance
         */
        CallResult.prototype.message = "";

        /**
         * CallResult data.
         * @member {Uint8Array} data
         * @memberof common.CallResult
         * @instance
         */
        CallResult.prototype.data = $util.newBuffer([]);

        /**
         * Creates a new CallResult instance using the specified properties.
         * @function create
         * @memberof common.CallResult
         * @static
         * @param {common.ICallResult=} [properties] Properties to set
         * @returns {common.CallResult} CallResult instance
         */
        CallResult.create = function create(properties) {
            return new CallResult(properties);
        };

        /**
         * Encodes the specified CallResult message. Does not implicitly {@link common.CallResult.verify|verify} messages.
         * @function encode
         * @memberof common.CallResult
         * @static
         * @param {common.ICallResult} message CallResult message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        CallResult.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.code != null && Object.hasOwnProperty.call(message, "code"))
                writer.uint32(/* id 1, wireType 0 =*/8).int32(message.code);
            if (message.message != null && Object.hasOwnProperty.call(message, "message"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.message);
            if (message.data != null && Object.hasOwnProperty.call(message, "data"))
                writer.uint32(/* id 3, wireType 2 =*/26).bytes(message.data);
            return writer;
        };

        /**
         * Encodes the specified CallResult message, length delimited. Does not implicitly {@link common.CallResult.verify|verify} messages.
         * @function encodeDelimited
         * @memberof common.CallResult
         * @static
         * @param {common.ICallResult} message CallResult message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        CallResult.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a CallResult message from the specified reader or buffer.
         * @function decode
         * @memberof common.CallResult
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {common.CallResult} CallResult
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        CallResult.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.common.CallResult();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1: {
                        message.code = reader.int32();
                        break;
                    }
                case 2: {
                        message.message = reader.string();
                        break;
                    }
                case 3: {
                        message.data = reader.bytes();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a CallResult message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof common.CallResult
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {common.CallResult} CallResult
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        CallResult.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a CallResult message.
         * @function verify
         * @memberof common.CallResult
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        CallResult.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.code != null && message.hasOwnProperty("code"))
                if (!$util.isInteger(message.code))
                    return "code: integer expected";
            if (message.message != null && message.hasOwnProperty("message"))
                if (!$util.isString(message.message))
                    return "message: string expected";
            if (message.data != null && message.hasOwnProperty("data"))
                if (!(message.data && typeof message.data.length === "number" || $util.isString(message.data)))
                    return "data: buffer expected";
            return null;
        };

        /**
         * Creates a CallResult message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof common.CallResult
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {common.CallResult} CallResult
         */
        CallResult.fromObject = function fromObject(object) {
            if (object instanceof $root.common.CallResult)
                return object;
            var message = new $root.common.CallResult();
            if (object.code != null)
                message.code = object.code | 0;
            if (object.message != null)
                message.message = String(object.message);
            if (object.data != null)
                if (typeof object.data === "string")
                    $util.base64.decode(object.data, message.data = $util.newBuffer($util.base64.length(object.data)), 0);
                else if (object.data.length >= 0)
                    message.data = object.data;
            return message;
        };

        /**
         * Creates a plain object from a CallResult message. Also converts values to other types if specified.
         * @function toObject
         * @memberof common.CallResult
         * @static
         * @param {common.CallResult} message CallResult
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        CallResult.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.code = 0;
                object.message = "";
                if (options.bytes === String)
                    object.data = "";
                else {
                    object.data = [];
                    if (options.bytes !== Array)
                        object.data = $util.newBuffer(object.data);
                }
            }
            if (message.code != null && message.hasOwnProperty("code"))
                object.code = message.code;
            if (message.message != null && message.hasOwnProperty("message"))
                object.message = message.message;
            if (message.data != null && message.hasOwnProperty("data"))
                object.data = options.bytes === String ? $util.base64.encode(message.data, 0, message.data.length) : options.bytes === Array ? Array.prototype.slice.call(message.data) : message.data;
            return object;
        };

        /**
         * Converts this CallResult to JSON.
         * @function toJSON
         * @memberof common.CallResult
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        CallResult.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for CallResult
         * @function getTypeUrl
         * @memberof common.CallResult
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        CallResult.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/common.CallResult";
        };

        return CallResult;
    })();

    return common;
})();

module.exports = $root;
