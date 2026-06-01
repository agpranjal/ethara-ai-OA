from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from ..database import get_db
from ..models import Product, Customer, Order
from ..schemas import DashboardSummary, LowStockProduct

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

LOW_STOCK_THRESHOLD = 10


@router.get("/summary", response_model=DashboardSummary)
def get_summary(db: Session = Depends(get_db)):
    total_products = db.query(func.count(Product.id)).scalar()
    total_customers = db.query(func.count(Customer.id)).scalar()
    total_orders = db.query(func.count(Order.id)).scalar()
    total_revenue = db.query(func.sum(Order.total_amount)).scalar() or 0.0

    low_stock = (
        db.query(Product)
        .filter(Product.quantity < LOW_STOCK_THRESHOLD)
        .order_by(Product.quantity)
        .limit(20)
        .all()
    )

    return DashboardSummary(
        total_products=total_products,
        total_customers=total_customers,
        total_orders=total_orders,
        total_revenue=round(float(total_revenue), 2),
        low_stock_products=[
            LowStockProduct(id=p.id, name=p.name, sku=p.sku, quantity=p.quantity)
            for p in low_stock
        ],
    )
