from random import triangular
from matplotlib import pyplot

from fuzzylogic.classes import Domain, Set, Rule
from fuzzylogic.hedges import very
from fuzzylogic.functions import R, S,alpha, triangular

pageSize = Domain("pageSize", -80, 80)
requestNb = Domain("requestNb", 0, 100)
DOMsize = Domain("DOMsize", 0, 2000)
sustainable = Domain("Sustainable",0,100)

pageSize.excellent = triangular(0,10)
pageSize.medium = triangular(10,20)
pageSize.bad = triangular(20,30)

requestNb.excellent = triangular(0,10)
requestNb.medium = triangular(10,20)
requestNb.bad = triangular(20,30)

DOMsize.excellent = triangular(0,10)
DOMsize.medium = triangular(10,20)
DOMsize.bad = triangular(20,30)

sustainable.excellent = triangular(0,10)
sustainable.medium = triangular(10,20)
sustainable.bad = triangular(20,30)

R1 = Rule({(pageSize.excellent, requestNb.excellent): sustainable.excellent})
R2 = Rule({(requestNb.excellent, DOMsize.excellent): sustainable.excellent})
R2 = Rule({(pageSize.bad, DOMsize.excellent): sustainable.excellent})

values = {pageSize: 50, requestNb: 160, DOMsize:150}
print(R1(values), R2(values), R3(values), "=>", rules(values))