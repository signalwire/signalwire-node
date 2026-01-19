import BaseCall, {
  EXECUTE_ANSWER_ERROR_CAUSE_CODE,
  EXECUTE_ATTACH_ERROR_CAUSE_CODE,
  REMOTE_SDP_ERROR_CAUSE_CODE,
} from '../../src/webrtc/BaseCall'
import { Bye } from '../../src/messages/Verto'
import { State } from '../../src/webrtc/constants'

// Mock dependencies
jest.mock('../../src/messages/Verto')
jest.mock('../../src/util/logger', () => {
  return {
    __esModule: true,
    default: {
      trace: jest.fn(),
      debug: jest.fn(),
      error: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
    },
  }
})

// Get mocked version
const MockedBye = Bye as jest.MockedClass<typeof Bye>

// Create a concrete implementation of the abstract BaseCall class for testing
class TestCall extends BaseCall {
  constructor(session, opts) {
    super(session, opts)
  }

  invite() {
    throw new Error('Method not implemented.')
  }

  answer(params) {
    throw new Error('Method not implemented.')
  }

  // Add protected method accessor for testing
  testExecute(msg) {
    return this['_execute'](msg)
  }
}

describe('BaseCall', () => {
  let mockSession
  let call
  let mockExecute

  beforeEach(() => {
    jest.clearAllMocks()

    mockExecute = jest.fn().mockResolvedValue({})

    mockSession = {
      sessionid: 'test-session-id',
      execute: mockExecute,
      uuid: 'test-uuid',
      mediaConstraints: {
        audio: true,
        video: false,
      },
      options: {
        userVariables: {},
      },
      calls: {},
    }

    call = new TestCall(mockSession, {
      id: 'test-call-id',
      destinationNumber: '1234567890',
    })

    // Mock the internal execute method by overriding it directly
    call['_execute'] = mockExecute

    // Mock peer if needed
    call.peer = {
      instance: {
        close: jest.fn(),
      },
    }
  })

  describe('hangup method', () => {
    describe('cause and causeCode handling', () => {
      it('should use default cause and causeCode when not provided', () => {
        call.hangup()

        expect(call.cause).toBe('NORMAL_CLEARING')
        expect(call.causeCode).toBe(16)
      })

      it('should use custom cause and causeCode when provided', () => {
        call.hangup({ cause: 'USER_BUSY', causeCode: 17 })

        expect(call.cause).toBe('USER_BUSY')
        expect(call.causeCode).toBe(17)
      })

      it('should use error cause and code for REMOTE_SDP_ERROR_CAUSE_CODE', () => {
        call.hangup({
          cause: 'NORMAL_CLEARING',
          causeCode: REMOTE_SDP_ERROR_CAUSE_CODE,
        })

        expect(call.cause).toBe('NORMAL_CLEARING')
        expect(call.causeCode).toBe(REMOTE_SDP_ERROR_CAUSE_CODE)
      })

      it('should use error cause and code for EXECUTE_ANSWER_ERROR_CAUSE_CODE', () => {
        call.hangup({
          cause: 'NORMAL_CLEARING',
          causeCode: EXECUTE_ANSWER_ERROR_CAUSE_CODE,
        })

        expect(call.cause).toBe('NORMAL_CLEARING')
        expect(call.causeCode).toBe(EXECUTE_ANSWER_ERROR_CAUSE_CODE)
      })

      it('should use error cause and code for EXECUTE_ATTACH_ERROR_CAUSE_CODE', () => {
        call.hangup({
          cause: 'NORMAL_CLEARING',
          causeCode: EXECUTE_ATTACH_ERROR_CAUSE_CODE,
        })

        expect(call.cause).toBe('NORMAL_CLEARING')
        expect(call.causeCode).toBe(EXECUTE_ATTACH_ERROR_CAUSE_CODE)
      })
    })

    describe('Bye message creation', () => {
      it('should create Bye message without cause and causeCode when execute is true', () => {
        const mockByeInstance = { method: 'verto.bye' } as any
        MockedBye.mockImplementation(() => mockByeInstance)

        call.hangup({ cause: 'TEST_CAUSE', causeCode: 999 })

        // cause and causeCode are stored on the call instance but NOT sent in the Bye message
        // because FreeSWitch doesn't support these fields in verto.bye
        expect(MockedBye).toHaveBeenCalledWith({
          sessid: 'test-session-id',
          dialogParams: call.options,
        })
      })

      it('should not create Bye message when execute is false', () => {
        call.hangup({}, false)

        expect(MockedBye).not.toHaveBeenCalled()
      })

      it('should execute the Bye message when execute is true', () => {
        const mockByeInstance = { method: 'verto.bye' } as any
        MockedBye.mockImplementation(() => mockByeInstance)

        call.hangup()

        expect(mockExecute).toHaveBeenCalledWith(mockByeInstance)
      })
    })
  })

  describe('verto.bye message payload', () => {
    it('should NOT include cause and causeCode in the Bye message parameters', () => {
      const mockByeInstance = { method: 'verto.bye' } as any
      MockedBye.mockImplementation(() => mockByeInstance)

      call.hangup({ cause: 'CUSTOM_CAUSE', causeCode: 123 })

      // cause and causeCode should be stored on call instance, not in Bye message
      expect(call.cause).toBe('CUSTOM_CAUSE')
      expect(call.causeCode).toBe(123)

      // Bye message should only contain sessid and dialogParams
      const byeCallArgs = MockedBye.mock.calls[0][0]
      expect(byeCallArgs).toEqual({
        sessid: 'test-session-id',
        dialogParams: call.options,
      })
      expect(byeCallArgs.cause).toBeUndefined()
      expect(byeCallArgs.causeCode).toBeUndefined()
    })

    it('should include session ID and dialog parameters', () => {
      const mockByeInstance = { method: 'verto.bye' } as any
      MockedBye.mockImplementation(() => mockByeInstance)

      call.hangup()

      const byeCallArgs = MockedBye.mock.calls[0][0]
      expect(byeCallArgs.sessid).toBe('test-session-id')
      expect(byeCallArgs.dialogParams).toBe(call.options)
    })

    it('should store default cause values on call instance when no parameters provided', () => {
      const mockByeInstance = { method: 'verto.bye' } as any
      MockedBye.mockImplementation(() => mockByeInstance)

      call.hangup()

      // Default values should be stored on the call instance
      expect(call.cause).toBe('NORMAL_CLEARING')
      expect(call.causeCode).toBe(16)

      // But not sent in the Bye message
      const byeCallArgs = MockedBye.mock.calls[0][0]
      expect(byeCallArgs.cause).toBeUndefined()
      expect(byeCallArgs.causeCode).toBeUndefined()
    })
  })
})
