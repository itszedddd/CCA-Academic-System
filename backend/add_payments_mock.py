import sys, os
import random
from datetime import datetime, timedelta
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal
from app.models import TuitionPayment, PaymentRecord

db = SessionLocal()

def seed_mock_payments():
    tuitions = db.query(TuitionPayment).filter(TuitionPayment.amount_paid > 0).all()
    count = 0
    
    for t in tuitions:
        # Check if payments already exist
        existing = db.query(PaymentRecord).filter(PaymentRecord.tuition_id == t.id).first()
        if existing:
            continue
            
        # We need to simulate payments totaling amount_paid
        remaining_to_mock = t.amount_paid
        
        # Split it into 1 or 2 past transactions
        chunks = random.randint(1, 2)
        if chunks == 1 or remaining_to_mock < 2000:
            pays = [remaining_to_mock]
        else:
            first_pay = round(remaining_to_mock * random.uniform(0.4, 0.6), 2)
            pays = [first_pay, round(remaining_to_mock - first_pay, 2)]
            
        base_date = datetime.now() - timedelta(days=random.randint(15, 60))
        
        for amt in pays:
            dt_str = base_date.strftime("%Y-%m-%dT%H:%M:%S.%fZ")
            or_num = f"{random.randint(100000, 999999)}"
            pr = PaymentRecord(
                tuition_id=t.id,
                amount=amt,
                or_number=or_num,
                date_recorded=dt_str,
                recorded_by=1 # admin
            )
            db.add(pr)
            count += 1
            # Move date forward a bit for second chunk
            base_date += timedelta(days=random.randint(5, 20))
            
    db.commit()
    print(f"Successfully generated {count} mock official receipts across {len(tuitions)} active accounts with balances.")

if __name__ == "__main__":
    seed_mock_payments()
