"""add first_name and last_name to users

Revision ID: 28f8ac607127
Revises: 04d233bc4621
Create Date: 2026-01-29 18:51:28.440348

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '28f8ac607127'
down_revision = '04d233bc4621'
branch_labels = None
depends_on = None


def upgrade():
    # 1. Add as nullable first
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.add_column(sa.Column('first_name', sa.String(length=100), nullable=True))
        batch_op.add_column(sa.Column('last_name', sa.String(length=100), nullable=True))

    # 2. Backfill existing rows
    op.execute("""
        UPDATE users 
        SET first_name = 'User', last_name = 'Account'
        WHERE first_name IS NULL OR last_name IS NULL
    """)

    # 3. Enforce NOT NULL constraint
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.alter_column('first_name', nullable=False)
        batch_op.alter_column('last_name', nullable=False)


def downgrade():
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.drop_column('last_name')
        batch_op.drop_column('first_name')

    # ### end Alembic commands ###
