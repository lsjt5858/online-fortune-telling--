import {
    Controller,
    Post,
    Get,
    Body,
    Param,
    Headers,
    Req,
    Res,
    HttpStatus,
    UseGuards,
} from '@nestjs/common'
import { Request, Response } from 'express'
import { PaymentService } from '../services/payment.service'
import { AuthGuard } from '../guards/auth.guard'
import { Public } from '../decorators/public.decorator'
import { PaymentChannel } from '@shared/types'

@Controller('api/v1/payment')
export class PaymentController {
    constructor(private readonly paymentService: PaymentService) { }

    /**
     * 创建支付订单
     * POST /api/v1/payment/create
     */
    @Post('create')
    @UseGuards(AuthGuard)
    async createPayment(
        @Body()
        body: {
            orderNo: string
            channel: PaymentChannel
            platform: 'app' | 'h5' | 'jsapi'
            openid?: string
        },
        @Req() req: Request
    ) {
        const userIp = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress

        const result = await this.paymentService.createPayment({
            orderNo: body.orderNo,
            channel: body.channel,
            platform: body.platform,
            userIp: userIp as string,
            openid: body.openid,
        })

        return {
            success: true,
            data: result,
        }
    }

    /**
     * 查询支付状态
     * GET /api/v1/payment/:paymentId
     */
    @Get(':paymentId')
    @UseGuards(AuthGuard)
    async queryPayment(@Param('paymentId') paymentId: string) {
        const result = await this.paymentService.queryPayment(paymentId)

        return {
            success: true,
            data: result,
        }
    }

    /**
     * 支付宝支付回调
     * POST /api/v1/payment/alipay/notify
     */
    @Post('alipay/notify')
    @Public() // 公开接口，不需要认证
    async alipayNotify(@Body() body: any, @Res() res: Response) {
        try {
            const result = await this.paymentService.handleAlipayNotify(body)
            return res.status(HttpStatus.OK).send(result)
        } catch (error) {
            console.error('Alipay notify error:', error)
            return res.status(HttpStatus.BAD_REQUEST).send('fail')
        }
    }

    /**
     * 微信支付回调
     * POST /api/v1/payment/wechat/notify
     */
    @Post('wechat/notify')
    @Public() // 公开接口，不需要认证
    async wechatPayNotify(
        @Headers() headers: any,
        @Body() body: any,
        @Req() req: Request,
        @Res() res: Response
    ) {
        try {
            // 获取原始请求体字符串
            const rawBody = JSON.stringify(body)

            const result = await this.paymentService.handleWechatPayNotify(
                {
                    'wechatpay-timestamp': headers['wechatpay-timestamp'],
                    'wechatpay-nonce': headers['wechatpay-nonce'],
                    'wechatpay-signature': headers['wechatpay-signature'],
                    'wechatpay-serial': headers['wechatpay-serial'],
                },
                rawBody
            )

            return res.status(HttpStatus.OK).json(result)
        } catch (error) {
            console.error('WechatPay notify error:', error)
            return res.status(HttpStatus.BAD_REQUEST).json({
                code: 'FAIL',
                message: '失败',
            })
        }
    }

    /**
     * 申请退款
     * POST /api/v1/payment/refund
     */
    @Post('refund')
    @UseGuards(AuthGuard)
    async refund(
        @Body()
        body: {
            orderNo: string
            refundAmount: number
            reason?: string
        }
    ) {
        const result = await this.paymentService.refund({
            orderNo: body.orderNo,
            refundAmount: body.refundAmount,
            reason: body.reason,
        })

        return {
            success: true,
            data: result,
        }
    }
}
