"""allow null storage_key for deleted files

Revision ID: a1b2c3d4e5f6
Revises: 0b946b9bd345
Create Date: 2026-02-07

"""
from alembic import op
import sqlalchemy as sa

revision = 'a1b2c3d4e5f6'
down_revision = '0b946b9bd345'
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table('files', schema=None) as batch_op:
        batch_op.alter_column(
            'storage_key',
            existing_type=sa.String(length=512),
            nullable=True,
        )


def downgrade():
    with op.batch_alter_table('files', schema=None) as batch_op:
        batch_op.alter_column(
            'storage_key',
            existing_type=sa.String(length=512),
            nullable=False,
        )
