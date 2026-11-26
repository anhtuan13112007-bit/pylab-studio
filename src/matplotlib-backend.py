"""Matplotlib backend for static plots rendered in PyLab's Python worker."""
from io import BytesIO
from itertools import count

from matplotlib.backend_bases import FigureManagerBase
from matplotlib.backends.backend_agg import FigureCanvasAgg

from _pylab_display import send_png


class FigureManager(FigureManagerBase):
    _ids = count(1)

    def __init__(self, canvas, num):
        super().__init__(canvas, num)
        self._plot_id = next(self._ids)

    def show(self):
        figure = self.canvas.figure
        title = figure.get_label() or next(
            (ax.get_title() for ax in figure.axes if ax.get_title()), ""
        )
        with BytesIO() as image:
            self.canvas.print_png(image)
            send_png(self._plot_id, self.num, title, image.getvalue())


class FigureCanvas(FigureCanvasAgg):
    manager_class = FigureManager


def show(*, block=None):
    # Visiting managers directly leaves the user's current axes and figure intact.
    from matplotlib._pylab_helpers import Gcf
    for manager in Gcf.get_all_fig_managers():
        manager.show()
