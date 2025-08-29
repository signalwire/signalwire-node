import BaseCall, { NORMAL_TEMPORARY_FAILURE_CODE, WRONG_CALL_STATE_CODE } from '../../src/webrtc/BaseCall'
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

      it('should use error cause and code for WRONG_CALL_STATE', () => {
        call.hangup({ cause: 'WRONG_CALL_STATE', causeCode: WRONG_CALL_STATE_CODE })

        expect(call.cause).toBe('WRONG_CALL_STATE')
        expect(call.causeCode).toBe(NORMAL_TEMPORARY_FAILURE_CODE)
      })

      it('should use error cause and code for NORMAL_TEMPORARY_FAILURE', () => {
        call.hangup({ cause: 'NORMAL_TEMPORARY_FAILURE', causeCode: NORMAL_TEMPORARY_FAILURE_CODE })

        expect(call.cause).toBe('NORMAL_TEMPORARY_FAILURE')
        expect(call.causeCode).toBe(NORMAL_TEMPORARY_FAILURE_CODE)
      })

      it('should use error cause and code for NORMAL_TEMPORARY_FAILURE', () => {
        call.hangup({ cause: 'NORMAL_TEMPORARY_FAILURE', causeCode: NORMAL_TEMPORARY_FAILURE_CODE })

        expect(call.cause).toBe('NORMAL_TEMPORARY_FAILURE')
        expect(call.causeCode).toBe(NORMAL_TEMPORARY_FAILURE_CODE)
      })
    })

    describe('Bye message creation', () => {
      it('should create Bye message with cause and causeCode when execute is true', () => {
        const mockByeInstance = { method: 'verto.bye' } as any
        MockedBye.mockImplementation(() => mockByeInstance)

        call.hangup({ cause: 'TEST_CAUSE', causeCode: 999 })

        expect(MockedBye).toHaveBeenCalledWith({
          sessid: 'test-session-id',
          dialogParams: call.options,
          cause: 'TEST_CAUSE',
          causeCode: 999,
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
    it('should include cause and causeCode in the Bye message parameters', () => {
      const mockByeInstance = { method: 'verto.bye' } as any
      MockedBye.mockImplementation(() => mockByeInstance)

      call.hangup({ cause: 'CUSTOM_CAUSE', causeCode: 123 })

      const byeCallArgs = MockedBye.mock.calls[0][0]
      expect(byeCallArgs).toEqual({
        sessid: 'test-session-id',
        dialogParams: call.options,
        cause: 'CUSTOM_CAUSE',
        causeCode: 123,
      })
    })

    it('should include session ID and dialog parameters', () => {
      const mockByeInstance = { method: 'verto.bye' } as any
      MockedBye.mockImplementation(() => mockByeInstance)

      call.hangup()

      const byeCallArgs = MockedBye.mock.calls[0][0]
      expect(byeCallArgs.sessid).toBe('test-session-id')
      expect(byeCallArgs.dialogParams).toBe(call.options)
    })

    it('should use default values when no parameters provided', () => {
      const mockByeInstance = { method: 'verto.bye' } as any
      MockedBye.mockImplementation(() => mockByeInstance)

      call.hangup()

      const byeCallArgs = MockedBye.mock.calls[0][0]
      expect(byeCallArgs.cause).toBe('NORMAL_CLEARING')
      expect(byeCallArgs.causeCode).toBe(16)
    })
  })
})
