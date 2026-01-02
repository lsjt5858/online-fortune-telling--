import {
    Controller,
    Post,
    Get,
    Body,
    Param,
    Query,
    Headers,
    Req,
    Res,
    HttpStatus,
    ParseIntPipe,
    DefaultValuePipe,
} from '@nestjs/common'
import { Request, Response } from 'express'
import { IsString, IsEnum, IsNumber, IsOptional, Min } from 'class-validator'
import { PaymentService } from '../services/payment.service'
import { Public } from '../decorators/public.decorator'
import { PaymentChannel } from '@shared/types'

// DTO 定义
class CreatePaymentDto {
    @IsString()
    orderNo: string

    @IsEnum(PaymentChannel)
    channel: PaymentChannel

    @IsEnum(['app', 'h5', 'jsapi'])
    platform: 'app' | 'h5' | 'jsapi'

    @IsOptional()
    @IsString()
    openid?: string
}

class RefundDto {
    @IsString()
    orderNo: string

    @IsNumber()
    @Min(1)
    refundAmount: number

    @IsOptional()
    @IsString()
    reason?: string
}

@Controller('v1/payment')
export class PaymentController {
    constructor(private readonly paymentService: PaymentService) { }

    /**
     * 创建支付订单
     * POST /api/v1/payment/create
     */
    @Post('create')
    async createPayment(
        @Body() body: CreatePaymentDto,
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

        return result
    }

    /**
     * 查询支付状态
     * GET /api/v1/payment/status/:paymentId
     */
    @Get('status/:paymentId')
    async queryPayment(@Param('paymentId') paymentId: string) {
        return this.paymentService.queryPayment(paymentId)
    }

    /**
     * 获取用户支付记录
     * GET /api/v1/payment/list
     */
    @Get('list')
    async getUserPayments(
        @Req() req: any,
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
    ) {
        return this.paymentService.getUserPayments(req.user.userId, page, pageSize)
    }

    /**
     * 关闭支付订单
     * POST /api/v1/payment/close/:paymentId
     */
    @Post('close/:paymentId')
    async closePayment(@Param('paymentId') paymentId: string) {
        return this.paymentService.closePayment(paymentId)
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
    async refund(@Body() body: RefundDto) {
        return this.paymentService.refund({
            orderNo: body.orderNo,
            refundAmount: body.refundAmount,
            reason: body.reason,
        })
    }
}
