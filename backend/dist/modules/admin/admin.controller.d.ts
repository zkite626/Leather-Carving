import { AdminService } from './admin.service';
import { AdminUserService } from './admin-user.service';
import { AdminContentService } from './admin-content.service';
import { AdminOrderService } from './admin-order.service';
import { AdminFinanceService } from './admin-finance.service';
import { AdminAuditService } from './admin-audit.service';
import { AdminCourseService } from './admin-course.service';
import { AdminProductService } from './admin-product.service';
import { DashboardQueryDto, UserQueryDto, UpdateUserRoleDto, UpdateUserStatusDto, CreateUserDto, UpdateUserDto, ContentReviewQueryDto, ApproveContentDto, RejectContentDto, BatchContentActionDto, OrderQueryDto, UpdateOrderStatusDto, FinanceQueryDto, AuditLogQueryDto, CourseQueryDto, ProductQueryDto } from './dto';
export declare class AdminController {
    private readonly adminService;
    private readonly adminUserService;
    private readonly adminContentService;
    private readonly adminOrderService;
    private readonly adminFinanceService;
    private readonly adminAuditService;
    private readonly adminCourseService;
    private readonly adminProductService;
    constructor(adminService: AdminService, adminUserService: AdminUserService, adminContentService: AdminContentService, adminOrderService: AdminOrderService, adminFinanceService: AdminFinanceService, adminAuditService: AdminAuditService, adminCourseService: AdminCourseService, adminProductService: AdminProductService);
    getDashboard(query: DashboardQueryDto): Promise<Record<string, unknown> | {
        userCount: number;
        courseCount: number;
        orderCount: number;
        revenue: number;
        todayNewUsers: number;
        todayOrders: number;
        todayRevenue: number;
        userGrowthChart: {
            date: string;
            count: number;
        }[];
        revenueChart: {
            date: string;
            amount: number;
        }[];
        topCourses: {
            id: string;
            title: string;
            coverImage: string | null;
            enrollCount: number;
        }[];
    }>;
    getRecentActivities(): Promise<({
        user: {
            id: string;
            nickname: string;
            avatar: string | null;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        userId: string | null;
        entityType: string;
        entityId: string | null;
        action: string;
        oldData: import("@prisma/client/runtime/client").JsonValue | null;
        newData: import("@prisma/client/runtime/client").JsonValue | null;
        ip: string | null;
        userAgent: string | null;
    })[]>;
    getUsers(query: UserQueryDto): Promise<{
        items: {
            id: string;
            email: string;
            phone: string | null;
            nickname: string;
            avatar: string | null;
            role: import("@prisma/client").$Enums.UserRole;
            status: import("@prisma/client").$Enums.UserStatus;
            emailVerified: boolean;
            lastLoginAt: Date | null;
            createdAt: Date;
            _count: {
                enrollments: number;
                artworks: number;
                orders: number;
            };
        }[];
        pagination: {
            page: number;
            pageSize: number;
            total: number;
            totalPages: number;
        };
    }>;
    createUser(dto: CreateUserDto): Promise<{
        id: string;
        email: string;
        phone: string | null;
        nickname: string;
        role: import("@prisma/client").$Enums.UserRole;
        status: import("@prisma/client").$Enums.UserStatus;
        createdAt: Date;
    }>;
    getUserById(id: string): Promise<{
        id: string;
        email: string;
        phone: string | null;
        nickname: string;
        avatar: string | null;
        bio: string | null;
        role: import("@prisma/client").$Enums.UserRole;
        status: import("@prisma/client").$Enums.UserStatus;
        emailVerified: boolean;
        lastLoginAt: Date | null;
        createdAt: Date;
        _count: {
            enrollments: number;
            artworks: number;
            products: number;
            orders: number;
        };
    }>;
    updateUser(id: string, dto: UpdateUserDto): Promise<{
        id: string;
        email: string;
        phone: string | null;
        nickname: string;
        avatar: string | null;
        bio: string | null;
        role: import("@prisma/client").$Enums.UserRole;
        status: import("@prisma/client").$Enums.UserStatus;
        createdAt: Date;
    }>;
    updateUserRole(id: string, dto: UpdateUserRoleDto): Promise<{
        id: string;
        email: string;
        nickname: string;
        role: import("@prisma/client").$Enums.UserRole;
        status: import("@prisma/client").$Enums.UserStatus;
    }>;
    updateUserStatus(id: string, dto: UpdateUserStatusDto): Promise<{
        id: string;
        email: string;
        nickname: string;
        role: import("@prisma/client").$Enums.UserRole;
        status: import("@prisma/client").$Enums.UserStatus;
    }>;
    deleteUser(id: string): Promise<{
        message: string;
    }>;
    getCourses(query: CourseQueryDto): Promise<{
        items: {
            teacherName: string;
            price: string;
            originalPrice: string | null;
            rating: string;
            _count: {
                enrollments: number;
                chapters: number;
            };
            teacher: {
                user: {
                    nickname: string;
                    avatar: string | null;
                };
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                userId: string;
                title: string;
                specialties: string[];
                experience: number;
                certifications: import("@prisma/client/runtime/client").JsonValue | null;
                introduction: string | null;
                isVerified: boolean;
            };
            id: string;
            status: import("@prisma/client").$Enums.CourseStatus;
            deletedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            slug: string;
            description: string | null;
            coverImage: string | null;
            tags: string[];
            category: string | null;
            subtitle: string | null;
            level: import("@prisma/client").$Enums.CourseLevel;
            isFree: boolean;
            enrollCount: number;
            totalDuration: number;
            totalLessons: number;
            metadata: import("@prisma/client/runtime/client").JsonValue | null;
            publishedAt: Date | null;
            teacherId: string;
        }[];
        pagination: {
            page: number;
            pageSize: number;
            total: number;
            totalPages: number;
        };
    }>;
    createCourse(dto: Record<string, unknown>, req: {
        user: {
            sub: string;
        };
    }): Promise<{
        teacherName: string;
        price: string;
        originalPrice: string | null;
        teacher: {
            user: {
                nickname: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            title: string;
            specialties: string[];
            experience: number;
            certifications: import("@prisma/client/runtime/client").JsonValue | null;
            introduction: string | null;
            isVerified: boolean;
        };
        id: string;
        status: import("@prisma/client").$Enums.CourseStatus;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        slug: string;
        description: string | null;
        coverImage: string | null;
        rating: import("@prisma/client-runtime-utils").Decimal;
        tags: string[];
        category: string | null;
        subtitle: string | null;
        level: import("@prisma/client").$Enums.CourseLevel;
        isFree: boolean;
        enrollCount: number;
        totalDuration: number;
        totalLessons: number;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
        publishedAt: Date | null;
        teacherId: string;
    }>;
    getCourseById(id: string): Promise<{
        _count: {
            enrollments: number;
        };
        teacher: {
            user: {
                nickname: string;
                avatar: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            title: string;
            specialties: string[];
            experience: number;
            certifications: import("@prisma/client/runtime/client").JsonValue | null;
            introduction: string | null;
            isVerified: boolean;
        };
        chapters: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            sortOrder: number;
            courseId: string;
        }[];
    } & {
        id: string;
        status: import("@prisma/client").$Enums.CourseStatus;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        slug: string;
        originalPrice: import("@prisma/client-runtime-utils").Decimal | null;
        description: string | null;
        coverImage: string | null;
        price: import("@prisma/client-runtime-utils").Decimal;
        rating: import("@prisma/client-runtime-utils").Decimal;
        tags: string[];
        category: string | null;
        subtitle: string | null;
        level: import("@prisma/client").$Enums.CourseLevel;
        isFree: boolean;
        enrollCount: number;
        totalDuration: number;
        totalLessons: number;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
        publishedAt: Date | null;
        teacherId: string;
    }>;
    updateCourseStatus(id: string, dto: {
        status: string;
    }): Promise<{
        id: string;
        status: import("@prisma/client").$Enums.CourseStatus;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        slug: string;
        originalPrice: import("@prisma/client-runtime-utils").Decimal | null;
        description: string | null;
        coverImage: string | null;
        price: import("@prisma/client-runtime-utils").Decimal;
        rating: import("@prisma/client-runtime-utils").Decimal;
        tags: string[];
        category: string | null;
        subtitle: string | null;
        level: import("@prisma/client").$Enums.CourseLevel;
        isFree: boolean;
        enrollCount: number;
        totalDuration: number;
        totalLessons: number;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
        publishedAt: Date | null;
        teacherId: string;
    }>;
    deleteCourse(id: string): Promise<{
        message: string;
    }>;
    getProducts(query: ProductQueryDto): Promise<{
        items: {
            price: string;
            originalPrice: string | null;
            rating: string;
            merchant: {
                id: string;
                nickname: string;
                avatar: string | null;
            };
            category: {
                name: string;
                id: string;
            };
            images: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                sortOrder: number;
                productId: string;
                url: string;
            }[];
            _count: {
                reviews: number;
                orderItems: number;
            };
            name: string;
            id: string;
            status: import("@prisma/client").$Enums.ProductStatus;
            deletedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
            slug: string;
            merchantId: string;
            categoryId: string;
            description: string | null;
            coverImage: string | null;
            stock: number;
            stockAlert: number;
            sales: number;
            isGuangxi: boolean;
            attributes: import("@prisma/client/runtime/client").JsonValue | null;
            tags: string[];
            version: number;
        }[];
        pagination: {
            page: number;
            pageSize: number;
            total: number;
            totalPages: number;
        };
    }>;
    getProductCategories(): Promise<{
        name: string;
        id: string;
        parentId: string | null;
        icon: string | null;
    }[]>;
    createProduct(dto: Record<string, unknown>): Promise<{
        price: string;
        originalPrice: string | null;
        merchant: {
            id: string;
            nickname: string;
        };
        category: {
            name: string;
            id: string;
        };
        name: string;
        id: string;
        status: import("@prisma/client").$Enums.ProductStatus;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        merchantId: string;
        categoryId: string;
        description: string | null;
        coverImage: string | null;
        stock: number;
        stockAlert: number;
        sales: number;
        rating: import("@prisma/client-runtime-utils").Decimal;
        isGuangxi: boolean;
        attributes: import("@prisma/client/runtime/client").JsonValue | null;
        tags: string[];
        version: number;
    }>;
    getProductById(id: string): Promise<{
        merchant: {
            id: string;
            email: string;
            nickname: string;
            avatar: string | null;
        };
        category: {
            name: string;
            id: string;
        };
        images: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            sortOrder: number;
            productId: string;
            url: string;
        }[];
        _count: {
            reviews: number;
            orderItems: number;
        };
    } & {
        name: string;
        id: string;
        status: import("@prisma/client").$Enums.ProductStatus;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        originalPrice: import("@prisma/client-runtime-utils").Decimal | null;
        merchantId: string;
        categoryId: string;
        description: string | null;
        coverImage: string | null;
        price: import("@prisma/client-runtime-utils").Decimal;
        stock: number;
        stockAlert: number;
        sales: number;
        rating: import("@prisma/client-runtime-utils").Decimal;
        isGuangxi: boolean;
        attributes: import("@prisma/client/runtime/client").JsonValue | null;
        tags: string[];
        version: number;
    }>;
    updateProduct(id: string, dto: Record<string, unknown>): Promise<{
        price: string;
        originalPrice: string | null;
        merchant: {
            id: string;
            nickname: string;
        };
        category: {
            name: string;
            id: string;
        };
        name: string;
        id: string;
        status: import("@prisma/client").$Enums.ProductStatus;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        merchantId: string;
        categoryId: string;
        description: string | null;
        coverImage: string | null;
        stock: number;
        stockAlert: number;
        sales: number;
        rating: import("@prisma/client-runtime-utils").Decimal;
        isGuangxi: boolean;
        attributes: import("@prisma/client/runtime/client").JsonValue | null;
        tags: string[];
        version: number;
    }>;
    updateProductStatus(id: string, dto: {
        status: string;
    }): Promise<{
        name: string;
        id: string;
        status: import("@prisma/client").$Enums.ProductStatus;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        originalPrice: import("@prisma/client-runtime-utils").Decimal | null;
        merchantId: string;
        categoryId: string;
        description: string | null;
        coverImage: string | null;
        price: import("@prisma/client-runtime-utils").Decimal;
        stock: number;
        stockAlert: number;
        sales: number;
        rating: import("@prisma/client-runtime-utils").Decimal;
        isGuangxi: boolean;
        attributes: import("@prisma/client/runtime/client").JsonValue | null;
        tags: string[];
        version: number;
    }>;
    deleteProduct(id: string): Promise<{
        message: string;
    }>;
    getContentReview(query: ContentReviewQueryDto): Promise<{
        items: {
            id: string;
            type: string;
            title: string;
            status: string;
            author: {
                id: string;
                nickname: string;
                avatar: string | null;
            };
            createdAt: Date;
            updatedAt: Date;
            content?: string;
            coverImage?: string | null;
        }[];
        pagination: {
            page: number;
            pageSize: number;
            total: number;
            totalPages: number;
        };
    }>;
    approveContent(id: string, type: string, dto: ApproveContentDto): Promise<{
        id: string;
        status: import("@prisma/client").$Enums.CourseStatus;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        slug: string;
        originalPrice: import("@prisma/client-runtime-utils").Decimal | null;
        description: string | null;
        coverImage: string | null;
        price: import("@prisma/client-runtime-utils").Decimal;
        rating: import("@prisma/client-runtime-utils").Decimal;
        tags: string[];
        category: string | null;
        subtitle: string | null;
        level: import("@prisma/client").$Enums.CourseLevel;
        isFree: boolean;
        enrollCount: number;
        totalDuration: number;
        totalLessons: number;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
        publishedAt: Date | null;
        teacherId: string;
    } | {
        id: string;
        status: import("@prisma/client").$Enums.ArtworkStatus;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        title: string;
        description: string | null;
        coverImage: string | null;
        tags: string[];
        category: string | null;
        techniques: string[];
        materials: string[];
        story: string | null;
        likeCount: number;
        viewCount: number;
        is3D: boolean;
        modelUrl: string | null;
    } | {
        id: string;
        status: import("@prisma/client").$Enums.PostStatus;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        title: string;
        tags: string[];
        images: string[];
        type: import("@prisma/client").$Enums.PostType;
        content: string;
        likeCount: number;
        viewCount: number;
        commentCount: number;
        isPinned: boolean;
    }>;
    rejectContent(id: string, type: string, dto: RejectContentDto): Promise<{
        id: string;
        status: import("@prisma/client").$Enums.CourseStatus;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        slug: string;
        originalPrice: import("@prisma/client-runtime-utils").Decimal | null;
        description: string | null;
        coverImage: string | null;
        price: import("@prisma/client-runtime-utils").Decimal;
        rating: import("@prisma/client-runtime-utils").Decimal;
        tags: string[];
        category: string | null;
        subtitle: string | null;
        level: import("@prisma/client").$Enums.CourseLevel;
        isFree: boolean;
        enrollCount: number;
        totalDuration: number;
        totalLessons: number;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
        publishedAt: Date | null;
        teacherId: string;
    } | {
        id: string;
        status: import("@prisma/client").$Enums.ArtworkStatus;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        title: string;
        description: string | null;
        coverImage: string | null;
        tags: string[];
        category: string | null;
        techniques: string[];
        materials: string[];
        story: string | null;
        likeCount: number;
        viewCount: number;
        is3D: boolean;
        modelUrl: string | null;
    } | {
        id: string;
        status: import("@prisma/client").$Enums.PostStatus;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        title: string;
        tags: string[];
        images: string[];
        type: import("@prisma/client").$Enums.PostType;
        content: string;
        likeCount: number;
        viewCount: number;
        commentCount: number;
        isPinned: boolean;
    }>;
    batchApprove(dto: BatchContentActionDto): Promise<({
        id: string;
        type: string;
        success: boolean;
        error?: undefined;
    } | {
        id: string;
        success: boolean;
        error: string;
        type?: undefined;
    })[]>;
    batchReject(dto: BatchContentActionDto): Promise<({
        id: string;
        type: string;
        success: boolean;
        error?: undefined;
    } | {
        id: string;
        success: boolean;
        error: string;
        type?: undefined;
    })[]>;
    getOrders(query: OrderQueryDto): Promise<{
        items: ({
            user: {
                id: string;
                email: string;
                nickname: string;
                avatar: string | null;
            };
            items: {
                productImage: string | null;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                price: import("@prisma/client-runtime-utils").Decimal;
                productId: string;
                quantity: number;
                productName: string;
                orderId: string;
            }[];
            payments: {
                id: string;
                status: import("@prisma/client").$Enums.PaymentStatus;
                createdAt: Date;
                updatedAt: Date;
                paidAt: Date | null;
                orderId: string;
                transactionNo: string | null;
                method: import("@prisma/client").$Enums.PaymentMethod;
                amount: import("@prisma/client-runtime-utils").Decimal;
                rawData: import("@prisma/client/runtime/client").JsonValue | null;
            }[];
        } & {
            address: import("@prisma/client/runtime/client").JsonValue;
            id: string;
            status: import("@prisma/client").$Enums.OrderStatus;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            completedAt: Date | null;
            orderNo: string;
            totalAmount: import("@prisma/client-runtime-utils").Decimal;
            payAmount: import("@prisma/client-runtime-utils").Decimal;
            remark: string | null;
            paidAt: Date | null;
            shippedAt: Date | null;
            cancelledAt: Date | null;
        })[];
        pagination: {
            page: number;
            pageSize: number;
            total: number;
            totalPages: number;
        };
    }>;
    updateOrderStatus(id: string, dto: UpdateOrderStatusDto): Promise<{
        user: {
            id: string;
            email: string;
            nickname: string;
        };
        items: {
            productImage: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            price: import("@prisma/client-runtime-utils").Decimal;
            productId: string;
            quantity: number;
            productName: string;
            orderId: string;
        }[];
    } & {
        address: import("@prisma/client/runtime/client").JsonValue;
        id: string;
        status: import("@prisma/client").$Enums.OrderStatus;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        completedAt: Date | null;
        orderNo: string;
        totalAmount: import("@prisma/client-runtime-utils").Decimal;
        payAmount: import("@prisma/client-runtime-utils").Decimal;
        remark: string | null;
        paidAt: Date | null;
        shippedAt: Date | null;
        cancelledAt: Date | null;
    }>;
    getFinanceSummary(): Promise<{
        totalRevenue: number;
        monthlyRevenue: number;
        monthGrowth: number;
        orderCount: number;
        paidOrderCount: number;
        averageOrderValue: number;
    }>;
    getTransactions(query: FinanceQueryDto): Promise<{
        items: ({
            order: {
                user: {
                    id: string;
                    email: string;
                    nickname: string;
                };
                items: {
                    price: import("@prisma/client-runtime-utils").Decimal;
                    quantity: number;
                    productName: string;
                }[];
            } & {
                address: import("@prisma/client/runtime/client").JsonValue;
                id: string;
                status: import("@prisma/client").$Enums.OrderStatus;
                createdAt: Date;
                updatedAt: Date;
                userId: string;
                completedAt: Date | null;
                orderNo: string;
                totalAmount: import("@prisma/client-runtime-utils").Decimal;
                payAmount: import("@prisma/client-runtime-utils").Decimal;
                remark: string | null;
                paidAt: Date | null;
                shippedAt: Date | null;
                cancelledAt: Date | null;
            };
        } & {
            id: string;
            status: import("@prisma/client").$Enums.PaymentStatus;
            createdAt: Date;
            updatedAt: Date;
            paidAt: Date | null;
            orderId: string;
            transactionNo: string | null;
            method: import("@prisma/client").$Enums.PaymentMethod;
            amount: import("@prisma/client-runtime-utils").Decimal;
            rawData: import("@prisma/client/runtime/client").JsonValue | null;
        })[];
        pagination: {
            page: number;
            pageSize: number;
            total: number;
            totalPages: number;
        };
    }>;
    getMerchantSettlements(): Promise<{
        totalAmount: number;
        orderCount: number;
        merchantId: string;
        nickname: string;
        email: string;
    }[]>;
    exportTransactions(query: FinanceQueryDto, res: import('express').Response): Promise<void>;
    getAuditLogs(query: AuditLogQueryDto): Promise<{
        items: ({
            user: {
                id: string;
                email: string;
                nickname: string;
                avatar: string | null;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            userId: string | null;
            entityType: string;
            entityId: string | null;
            action: string;
            oldData: import("@prisma/client/runtime/client").JsonValue | null;
            newData: import("@prisma/client/runtime/client").JsonValue | null;
            ip: string | null;
            userAgent: string | null;
        })[];
        pagination: {
            page: number;
            pageSize: number;
            total: number;
            totalPages: number;
        };
    }>;
}
